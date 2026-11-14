import { TomeWordsPracticeAPI, WordsPracticeError } from '../api/TomeWordsPracticeAPI';
import { TotoAPI } from '../api/TotoAPI';

jest.mock('../api/TotoAPI');

const mockFetch = jest.fn();

function fakeResponse(status: number, body: unknown) {
    return { ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response;
}

const session = { id: 's1', status: 'in_progress', startedAt: '2026-11-09T10:00:00Z', completedAt: null, words: [] };

beforeEach(() => {
    mockFetch.mockReset();
    (TotoAPI as unknown as jest.Mock).mockImplementation(() => ({ fetch: mockFetch }));
});

describe('TomeWordsPracticeAPI.startSession', () => {

    it('POSTs to the sessions collection without the microservice basepath and returns the new session', async () => {
        mockFetch.mockResolvedValue(fakeResponse(201, session));

        const result = await new TomeWordsPracticeAPI().startSession('u1');

        expect(mockFetch).toHaveBeenCalledWith('tome-ms-language', '/users/u1/wordsPracticeSessions', expect.objectContaining({ method: 'POST' }));
        expect(result).toEqual({ sessionId: 's1', resumed: false });
    });

    it('resumes the open session on 409, using the sessionId from the error body', async () => {
        mockFetch.mockResolvedValue(fakeResponse(409, { code: 409, message: 'open', sessionId: 'open-1' }));

        const result = await new TomeWordsPracticeAPI().startSession('u1');

        expect(result).toEqual({ sessionId: 'open-1', resumed: true });
    });

    it('throws an emptyPool error on 400 emptyPool', async () => {
        mockFetch.mockResolvedValue(fakeResponse(400, { code: 400, message: 'none', reason: 'emptyPool' }));

        await expect(new TomeWordsPracticeAPI().startSession('u1')).rejects.toMatchObject({ status: 400, reason: 'emptyPool' });
    });

    it('throws on other failures', async () => {
        mockFetch.mockResolvedValue(fakeResponse(500, {}));

        await expect(new TomeWordsPracticeAPI().startSession('u1')).rejects.toBeInstanceOf(WordsPracticeError);
    });
});

describe('TomeWordsPracticeAPI.getSession', () => {

    it('returns the session', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, session));

        expect(await new TomeWordsPracticeAPI().getSession('u1', 's1')).toEqual(session);
        expect(mockFetch).toHaveBeenCalledWith('tome-ms-language', '/users/u1/wordsPracticeSessions/s1');
    });

    it('returns null on 404', async () => {
        mockFetch.mockResolvedValue(fakeResponse(404, {}));

        expect(await new TomeWordsPracticeAPI().getSession('u1', 's1')).toBeNull();
    });
});

describe('TomeWordsPracticeAPI.submitAnswer', () => {

    it('POSTs wordKey and userAnswer and returns the verdict', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, { isCorrect: false, correctAnswer: 'hus', isFirstAttempt: true }));

        const result = await new TomeWordsPracticeAPI().submitAnswer('u1', 's1', 'hus', 'huus');

        const [, path, options] = mockFetch.mock.calls[0];
        expect(path).toBe('/users/u1/wordsPracticeSessions/s1/answers');
        expect(JSON.parse(options.body)).toEqual({ wordKey: 'hus', userAnswer: 'huus' });
        expect(result).toEqual({ isCorrect: false, correctAnswer: 'hus', isFirstAttempt: true });
    });

    it('throws on failure so the page can keep the input and offer a retry', async () => {
        mockFetch.mockResolvedValue(fakeResponse(500, {}));

        await expect(new TomeWordsPracticeAPI().submitAnswer('u1', 's1', 'hus', 'hus')).rejects.toBeInstanceOf(WordsPracticeError);
    });
});

describe('TomeWordsPracticeAPI.verifyAnswer', () => {

    it('POSTs wordKey and cefrLevel (not the answer) and returns the verdict', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, { valid: true, explanation: 'ok' }));
        const controller = new AbortController();

        const result = await new TomeWordsPracticeAPI().verifyAnswer('u1', 's1', { wordKey: 'stor', cefrLevel: 'A1' }, controller.signal);

        const [, path, options] = mockFetch.mock.calls[0];
        expect(path).toBe('/users/u1/wordsPracticeSessions/s1/answers/verify');
        expect(JSON.parse(options.body)).toEqual({ wordKey: 'stor', cefrLevel: 'A1' });
        expect(options.signal).toBe(controller.signal);
        expect(result).toEqual({ valid: true, explanation: 'ok' });
    });

    it('throws with the status on 409 (already checked)', async () => {
        mockFetch.mockResolvedValue(fakeResponse(409, {}));

        await expect(new TomeWordsPracticeAPI().verifyAnswer('u1', 's1', { wordKey: 'stor', cefrLevel: 'A1' })).rejects.toMatchObject({ status: 409 });
    });
});

describe('TomeWordsPracticeAPI.completeSession', () => {

    it('returns the completed session', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, { ...session, status: 'completed' }));

        const result = await new TomeWordsPracticeAPI().completeSession('u1', 's1');

        expect(mockFetch).toHaveBeenCalledWith('tome-ms-language', '/users/u1/wordsPracticeSessions/s1/complete', expect.objectContaining({ method: 'POST' }));
        expect(result.status).toBe('completed');
    });

    it('exposes outstandingWordKeys on a 400 drift error', async () => {
        mockFetch.mockResolvedValue(fakeResponse(400, { code: 400, message: 'outstanding', outstandingWordKeys: ['a', 'b'] }));

        await expect(new TomeWordsPracticeAPI().completeSession('u1', 's1')).rejects.toMatchObject({ status: 400, outstandingWordKeys: ['a', 'b'] });
    });
});

describe('TomeWordsPracticeAPI.getSummary', () => {

    it('fetches the pool size and open session id', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, { poolSize: 12, openSessionId: null }));

        expect(await new TomeWordsPracticeAPI().getSummary()).toEqual({ poolSize: 12, openSessionId: null });
        expect(mockFetch).toHaveBeenCalledWith('tome-ms-language', '/me/wordsPractice/summary');
    });
});
