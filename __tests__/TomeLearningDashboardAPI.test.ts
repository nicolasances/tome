import moment from 'moment';
import { TomeLearningDashboardAPI } from '../api/TomeLearningDashboardAPI';
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
