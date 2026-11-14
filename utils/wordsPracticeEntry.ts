import { StartWordsPracticeResult, WordsPracticeSummary } from '@/api/TomeWordsPracticeAPI';

/** State of the Home Words Practice entry (desktop tile / mobile Words button). */
export type WordsPracticeEntry =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'disabled', poolSize: number }
    | { status: 'start', poolSize: number }
    | { status: 'resume', poolSize: number, sessionId: string };

/**
 * Derives the entry state from the Words Practice summary.
 *
 * @param {WordsPracticeSummary | null | undefined} summary - undefined while loading, null when the load failed.
 *
 * @returns {WordsPracticeEntry} The state to render: pool size 0 → disabled; open session → resume; otherwise start.
 */
export function deriveWordsPracticeEntry(summary: WordsPracticeSummary | null | undefined): WordsPracticeEntry {

    if (summary === undefined) return { status: 'loading' };
    if (summary === null) return { status: 'error' };
    if (summary.poolSize === 0) return { status: 'disabled', poolSize: 0 };
    if (summary.openSessionId) return { status: 'resume', poolSize: summary.poolSize, sessionId: summary.openSessionId };

    return { status: 'start', poolSize: summary.poolSize };
}

/**
 * Resolves the session the entry should navigate to: the open one when resuming,
 * otherwise a freshly started one (the API maps a 409 to the already-open session).
 *
 * @param {WordsPracticeEntry} entry - The current entry state; must be 'start' or 'resume'.
 * @param {string} userId - The authenticated user's id.
 * @param {{ startSession: (userId: string) => Promise<StartWordsPracticeResult> }} api - The Words Practice API.
 *
 * @returns {Promise<string>} The id of the session to navigate to.
 */
export async function resolveWordsPracticeSessionId(entry: WordsPracticeEntry, userId: string, api: { startSession: (userId: string) => Promise<StartWordsPracticeResult> }): Promise<string> {

    if (entry.status === 'resume') return entry.sessionId;
    if (entry.status !== 'start') throw new Error(`Words Practice cannot be opened from state '${entry.status}'`);

    return (await api.startSession(userId)).sessionId;
}
