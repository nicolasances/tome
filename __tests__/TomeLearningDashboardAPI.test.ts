import moment from 'moment';
import { TomeLearningDashboardAPI, calculateModuleProgress } from '../api/TomeLearningDashboardAPI';
import { TotoAPI } from '../api/TotoAPI';

jest.mock('../api/TotoAPI');

// ─── Helpers ───────────────────────────────────────────────────────────────────

const mockFetch = jest.fn();

function fakeResponse(body: unknown) {
    return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

beforeEach(() => {
    mockFetch.mockReset();
    (TotoAPI as unknown as jest.Mock).mockImplementation(() => ({
        fetch: mockFetch,
        fetchJson: async (...args: any[]) => {
            const response = await mockFetch(...args);
            if (!response.ok) throw new Error('API error ' + response.status);
            return response.json();
        },
    }));
});

// ─── getWeeklySessionStats ──────────────────────────────────────────────────────

describe('TomeLearningDashboardAPI.getWeeklySessionStats', () => {

    it('calls GET /me/stats/dailyActivity with from = today minus 6 days', async () => {
        const expectedFrom = moment().subtract(6, 'days').format('YYYYMMDD');
        mockFetch.mockResolvedValue(fakeResponse({ from: expectedFrom, to: moment().format('YYYYMMDD'), days: [] }));

        const api = new TomeLearningDashboardAPI();
        await api.getWeeklySessionStats();

        expect(mockFetch).toHaveBeenCalledWith(
            'tome-ms-language',
            `/me/stats/dailyActivity?from=${expectedFrom}`,
        );
    });

    it('does NOT use Monday of the current ISO week as from', async () => {
        const monday = moment().startOf('isoWeek').format('YYYYMMDD');
        const rollingStart = moment().subtract(6, 'days').format('YYYYMMDD');
        mockFetch.mockResolvedValue(fakeResponse({ from: rollingStart, to: moment().format('YYYYMMDD'), days: [] }));

        const api = new TomeLearningDashboardAPI();
        await api.getWeeklySessionStats();

        const calledPath: string = mockFetch.mock.calls[0][1];

        // On any day other than Monday the two differ; the endpoint must use the rolling start
        if (monday !== rollingStart) {
            expect(calledPath).not.toContain(monday);
        }
        expect(calledPath).toContain(rollingStart);
    });
});

// ─── rePractice ──────────────────────────────────────────────────────────────────

describe('TomeLearningDashboardAPI.rePractice', () => {

    it('calls POST /users/:userId/modules/:moduleId/rePractice and returns conflict: false on success', async () => {
        mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

        const api = new TomeLearningDashboardAPI();
        const result = await api.rePractice('user-1', 'module-1');

        expect(mockFetch).toHaveBeenCalledWith(
            'tome-ms-language',
            '/users/user-1/modules/module-1/rePractice',
            { method: 'POST', headers: { 'Content-Type': 'application/json' } },
        );
        expect(result).toEqual({ conflict: false });
    });

    it('returns conflict: true with the open session id on 409', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 409, json: async () => ({ sessionId: 'session-42' }) });

        const api = new TomeLearningDashboardAPI();
        const result = await api.rePractice('user-1', 'module-1');

        expect(result).toEqual({ conflict: true, sessionId: 'session-42' });
    });

    it('throws when the server answers 409 without a sessionId in the body', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 409, json: async () => ({}) });

        const api = new TomeLearningDashboardAPI();

        await expect(api.rePractice('user-1', 'module-1')).rejects.toThrow();
    });

    it('throws for any other non-ok status', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });

        const api = new TomeLearningDashboardAPI();

        await expect(api.rePractice('user-1', 'module-1')).rejects.toThrow('500');
    });
});

// ─── calculateModuleProgress ─────────────────────────────────────────────────────

describe('calculateModuleProgress', () => {

    it('blends rung 1 partial coverage into a fraction of the 3-rung ladder', () => {
        const progress = calculateModuleProgress({ fullyCompletedRungs: 0, currentRungCoverage: { coveredCount: 3, totalCount: 12 } });

        expect(progress).toBeCloseTo(0.0833, 4);
    });

    it('blends rung 2 partial coverage with the one fully completed rung before it', () => {
        const progress = calculateModuleProgress({ fullyCompletedRungs: 1, currentRungCoverage: { coveredCount: 6, totalCount: 12 } });

        expect(progress).toBeCloseTo(0.5, 4);
    });

    it('reaches 1.0 when rung 3 is fully covered', () => {
        const progress = calculateModuleProgress({ fullyCompletedRungs: 2, currentRungCoverage: { coveredCount: 12, totalCount: 12 } });

        expect(progress).toBeCloseTo(1.0, 4);
    });

    it('reaches 1.0 once the whole ladder is complete, regardless of the current-rung counts', () => {
        const progress = calculateModuleProgress({ fullyCompletedRungs: 3, currentRungCoverage: { coveredCount: 12, totalCount: 12 } });

        expect(progress).toBeCloseTo(1.0, 4);
    });

    it('does not divide by zero when the module has no practice items', () => {
        const progress = calculateModuleProgress({ fullyCompletedRungs: 1, currentRungCoverage: { coveredCount: 0, totalCount: 0 } });

        expect(progress).toBeCloseTo(1 / 3, 4);
    });
});
