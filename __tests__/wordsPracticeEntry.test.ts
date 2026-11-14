import { deriveWordsPracticeEntry, resolveWordsPracticeSessionId } from '../utils/wordsPracticeEntry';
import { StartWordsPracticeResult, WordsPracticeError } from '../api/TomeWordsPracticeAPI';

// ─── deriveWordsPracticeEntry ─────────────────────────────────────────────────

describe('deriveWordsPracticeEntry', () => {

    it('is loading while the summary has not arrived', () => {
        expect(deriveWordsPracticeEntry(undefined)).toEqual({ status: 'loading' });
    });

    it('is in error when the summary failed to load', () => {
        expect(deriveWordsPracticeEntry(null)).toEqual({ status: 'error' });
    });

    it('is disabled when the pool is empty', () => {
        expect(deriveWordsPracticeEntry({ poolSize: 0, openSessionId: null })).toEqual({ status: 'disabled', poolSize: 0 });
    });

    it('offers to start a session when the pool has words and no session is open', () => {
        expect(deriveWordsPracticeEntry({ poolSize: 312, openSessionId: null })).toEqual({ status: 'start', poolSize: 312 });
    });

    it('offers to resume when a session is open', () => {
        expect(deriveWordsPracticeEntry({ poolSize: 312, openSessionId: 's-1' })).toEqual({ status: 'resume', poolSize: 312, sessionId: 's-1' });
    });
});

// ─── resolveWordsPracticeSessionId ────────────────────────────────────────────

describe('resolveWordsPracticeSessionId', () => {

    it('returns the open session without starting a new one when resuming', async () => {
        const api = { startSession: jest.fn() };

        const id = await resolveWordsPracticeSessionId({ status: 'resume', poolSize: 10, sessionId: 's-1' }, 'u-1', api);

        expect(id).toBe('s-1');
        expect(api.startSession).not.toHaveBeenCalled();
    });

    it('starts a session for the user and returns its id', async () => {
        const api = { startSession: jest.fn().mockResolvedValue({ sessionId: 's-new', resumed: false } as StartWordsPracticeResult) };

        const id = await resolveWordsPracticeSessionId({ status: 'start', poolSize: 10 }, 'u-1', api);

        expect(api.startSession).toHaveBeenCalledWith('u-1');
        expect(id).toBe('s-new');
    });

    it('returns the existing session id when the backend reports one is already open (409)', async () => {
        const api = { startSession: jest.fn().mockResolvedValue({ sessionId: 's-open', resumed: true } as StartWordsPracticeResult) };

        const id = await resolveWordsPracticeSessionId({ status: 'start', poolSize: 10 }, 'u-1', api);

        expect(id).toBe('s-open');
    });

    it('propagates a start failure', async () => {
        const api = { startSession: jest.fn().mockRejectedValue(new WordsPracticeError('boom', 500)) };

        await expect(resolveWordsPracticeSessionId({ status: 'start', poolSize: 10 }, 'u-1', api)).rejects.toThrow('boom');
    });

    it('refuses to open a session when the entry is disabled', async () => {
        const api = { startSession: jest.fn() };

        await expect(resolveWordsPracticeSessionId({ status: 'disabled', poolSize: 0 }, 'u-1', api)).rejects.toThrow();
        expect(api.startSession).not.toHaveBeenCalled();
    });
});
