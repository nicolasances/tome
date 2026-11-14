import { buildAuthenticatedUser, userInitial } from '../utils/userProfile';

/**
 * Builds an unsigned JWT carrying the given payload (enough for jwt-decode).
 */
function fakeJwt(payload: object): string {

    const encode = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');

    return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
}

// ─── buildAuthenticatedUser ───────────────────────────────────────────────────

describe('buildAuthenticatedUser', () => {

    it('uses the Google display name and picture, keeping the email from the Toto token', () => {
        const totoToken = fakeJwt({ user: 'jane@example.com' });
        const googleCredential = fakeJwt({ name: 'Jane Doe', picture: 'https://lh3.googleusercontent.com/a/jane', email: 'other@example.com' });

        expect(buildAuthenticatedUser(totoToken, googleCredential)).toEqual({ name: 'Jane Doe', email: 'jane@example.com', picture: 'https://lh3.googleusercontent.com/a/jane', idToken: totoToken });
    });

    it('falls back to the Toto user as name and has no picture when there is no Google credential', () => {
        const totoToken = fakeJwt({ user: 'jane@example.com' });

        expect(buildAuthenticatedUser(totoToken)).toEqual({ name: 'jane@example.com', email: 'jane@example.com', idToken: totoToken });
    });

    it('falls back to the Toto user as name when the Google credential has no name', () => {
        const totoToken = fakeJwt({ user: 'jane@example.com' });
        const googleCredential = fakeJwt({ picture: 'https://lh3.googleusercontent.com/a/jane' });

        expect(buildAuthenticatedUser(totoToken, googleCredential)).toEqual({ name: 'jane@example.com', email: 'jane@example.com', picture: 'https://lh3.googleusercontent.com/a/jane', idToken: totoToken });
    });

    it('still builds the user when the Google credential cannot be decoded', () => {
        const totoToken = fakeJwt({ user: 'jane@example.com' });

        expect(buildAuthenticatedUser(totoToken, 'not-a-jwt')).toEqual({ name: 'jane@example.com', email: 'jane@example.com', idToken: totoToken });
    });
});

// ─── userInitial ──────────────────────────────────────────────────────────────

describe('userInitial', () => {

    it('is the uppercased first letter of the name', () => {
        expect(userInitial({ name: 'jane Doe', email: 'x@example.com' })).toBe('J');
    });

    it('falls back to the first letter of the email when the name is empty', () => {
        expect(userInitial({ name: '  ', email: 'mark@example.com' })).toBe('M');
    });

    it('is a question mark when neither name nor email are known', () => {
        expect(userInitial(null)).toBe('?');
    });
});
