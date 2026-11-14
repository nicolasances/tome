import { jwtDecode } from "jwt-decode";

/**
 * The signed-in user, as stored in the `user` cookie and localStorage entry.
 */
export interface AuthenticatedUser {
    name: string;           // Display name. The Google profile name when available, otherwise the Toto user (email).
    email: string;          // The user's email, as carried by the Toto token.
    picture?: string;       // URL of the Google profile picture. Missing for sessions created before it was captured.
    idToken: string;        // The Toto token, sent as bearer token to the backend APIs.
}

/**
 * The minimal identity info needed to render an avatar fallback.
 */
export interface UserIdentity {
    name?: string;          // Display name of the user.
    email?: string;         // Email of the user.
}

/**
 * Profile fields read from the Google ID token (credential).
 */
interface GoogleProfile {
    name?: string;          // The Google display name.
    picture?: string;       // The Google profile picture URL.
}

/**
 * Builds the authenticated user from the Toto token, enriched with the Google profile.
 *
 * Rules:
 * - The email always comes from the Toto token (`user` claim).
 * - The name is the Google display name, falling back to the Toto user when missing.
 * - The picture is the Google profile picture, omitted when missing.
 * - An undecodable Google credential is ignored: sign-in must not fail because of the profile.
 *
 * @param {string} totoToken - The Toto token returned by the auth backend.
 * @param {string} googleCredential - The Google ID token received at sign-in (optional).
 *
 * @returns {AuthenticatedUser | null} the user, or null if the Toto token carries nothing
 */
export function buildAuthenticatedUser(totoToken: string, googleCredential?: string): AuthenticatedUser | null {

    const decodedToken = jwtDecode(totoToken) as any;

    if (!decodedToken) return null;

    const googleProfile = decodeGoogleProfile(googleCredential);

    const user: AuthenticatedUser = { name: googleProfile.name || decodedToken.user, email: decodedToken.user, idToken: totoToken };

    if (googleProfile.picture) user.picture = googleProfile.picture;

    return user;
}

/**
 * Extracts name and picture from a Google ID token. Returns an empty profile if the token is missing or invalid.
 *
 * @param {string} googleCredential - The Google ID token.
 *
 * @returns {GoogleProfile} the profile fields found
 */
function decodeGoogleProfile(googleCredential?: string): GoogleProfile {

    if (!googleCredential) return {};

    try {

        const decoded = jwtDecode(googleCredential) as any;

        return { name: decoded?.name, picture: decoded?.picture };

    } catch {

        return {};
    }
}

/**
 * Computes the single-letter avatar fallback for a user.
 *
 * Rules:
 * - First letter of the name, uppercased.
 * - Falls back to the first letter of the email.
 * - Falls back to "?" when neither is known.
 *
 * @param {UserIdentity | null} user - The user (can be null).
 *
 * @returns {string} the initial to display
 */
export function userInitial(user: UserIdentity | null | undefined): string {

    const source = user?.name?.trim() || user?.email?.trim();

    return source ? source.charAt(0).toUpperCase() : '?';
}
