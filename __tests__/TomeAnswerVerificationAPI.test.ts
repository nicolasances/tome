import { TomeAnswerVerificationAPI, VerifyAnswerInput, VerifyAnswerResponse } from '../api/TomeAnswerVerificationAPI';
import { TotoAPI } from '../api/TotoAPI';

jest.mock('../api/TotoAPI');

// ─── Helpers ───────────────────────────────────────────────────────────────────

const mockFetch = jest.fn();

function fakeResponse(status: number, body: unknown) {
    return { ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response;
}

const baseInput: VerifyAnswerInput = {
    exerciseId: 'ex-1',
    userAnswer: 'Hvor er du fra?',
    sessionId: 'session-1',
    cefrLevel: 'A1',
};

beforeEach(() => {
    mockFetch.mockReset();
    (TotoAPI as unknown as jest.Mock).mockImplementation(() => ({ fetch: mockFetch }));
});

// ─── Type-shape tests ───────────────────────────────────────────────────────────

describe('TomeAnswerVerificationAPI type shapes', () => {

    it('VerifyAnswerResponse supports an accepted verdict', () => {
        const r: VerifyAnswerResponse = { valid: true };
        expect(r.valid).toBe(true);
        expect(r.explanation).toBeUndefined();
    });

    it('VerifyAnswerResponse carries an explanation when not accepted', () => {
        const r: VerifyAnswerResponse = { valid: false, explanation: 'The verb must precede the subject.' };
        expect(r.valid).toBe(false);
        expect(r.explanation).toBe('The verb must precede the subject.');
    });
});

// ─── Behaviour tests ────────────────────────────────────────────────────────────

describe('TomeAnswerVerificationAPI.verifyAnswer', () => {

    it('POSTs to /exercises/:exerciseId/verifyAnswer on tome-ms-language with the verification body', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, { valid: true }));

        await new TomeAnswerVerificationAPI().verifyAnswer(baseInput);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [api, path, options] = mockFetch.mock.calls[0];
        expect(api).toBe('tome-ms-language');
        expect(path).toBe('/exercises/ex-1/verifyAnswer');
        expect(options.method).toBe('POST');
        expect(JSON.parse(options.body)).toEqual({ userAnswer: 'Hvor er du fra?', sessionId: 'session-1', cefrLevel: 'A1' });
    });

    it('returns the accepted verdict on valid: true', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, { valid: true }));

        const result = await new TomeAnswerVerificationAPI().verifyAnswer(baseInput);

        expect(result.valid).toBe(true);
    });

    it('returns the explanation on valid: false', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, { valid: false, explanation: 'Wrong word order.' }));

        const result = await new TomeAnswerVerificationAPI().verifyAnswer(baseInput);

        expect(result.valid).toBe(false);
        expect(result.explanation).toBe('Wrong word order.');
    });

    it('throws an error carrying status 409 when the exercise was already verified', async () => {
        mockFetch.mockResolvedValue(fakeResponse(409, { message: 'already verified' }));

        await expect(new TomeAnswerVerificationAPI().verifyAnswer(baseInput)).rejects.toMatchObject({ status: 409 });
    });

    it('throws an error carrying status 400 for a non-translation exercise', async () => {
        mockFetch.mockResolvedValue(fakeResponse(400, { message: 'not a translation exercise' }));

        await expect(new TomeAnswerVerificationAPI().verifyAnswer(baseInput)).rejects.toMatchObject({ status: 400 });
    });

    it('forwards the abort signal to the underlying fetch', async () => {
        mockFetch.mockResolvedValue(fakeResponse(200, { valid: true }));
        const controller = new AbortController();

        await new TomeAnswerVerificationAPI().verifyAnswer({ ...baseInput, signal: controller.signal });

        const [, , options] = mockFetch.mock.calls[0];
        expect(options.signal).toBe(controller.signal);
    });
});
