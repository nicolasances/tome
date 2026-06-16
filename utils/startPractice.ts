import { TomePracticeSessionAPI } from '@/api/TomePracticeSessionAPI';

/** Starts or resumes a practice session and returns the sessionId, or null on failure. */
export async function startPracticeAndGetSessionId(userId: string, moduleId: string): Promise<string | null> {
    const result = await new TomePracticeSessionAPI().startPracticeSession(userId, moduleId);
    if (!result) return null;
    return result.session.sessionId;
}
