import { TotoAPI } from "./TotoAPI";

/**
 * API class for module-scoped practice sessions (F10 / F04 exit).
 * Wraps the tome-ms-language backend.
 *
 * Endpoint mapping (basepath handled by NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT):
 *   - POST /users/:userId/modules/:moduleId/practiceSessions  → start a new session
 */
export class TomePracticeSessionAPI {

    /**
     * Starts a new practice session for the given user and module.
     *
     * Called at the end of the Grammar Introduction step (F04) to transition the
     * module into its practice phase. This call also flips UserModuleProgress to
     * "in_progress" on the backend (F10 business logic).
     *
     * Returns null when a session is already active for this module (HTTP 409) —
     * the caller should navigate to the practice screen regardless, where the
     * existing session will be loaded.
     *
     * Endpoint: POST /users/:userId/modules/:moduleId/practiceSessions
     */
    async startPracticeSession(userId: string, moduleId: string): Promise<StartPracticeSessionResponse | null> {
        const response = await new TotoAPI().fetch(
            'tome-ms-language',
            `/users/${userId}/modules/${moduleId}/practiceSessions`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status === 409) {
            // An active session already exists — navigate to practice anyway
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to start practice session (${response.status})`);
        }

        return response.json();
    }
}

// ─── API response types ────────────────────────────────────────────────────────

export interface StartPracticeSessionResponse {
    sessionId: string;
    moduleId: string;
    /** Ordered list of exercise IDs for this session */
    exerciseIds: string[];
    startedAt: string;
}
