import moment from 'moment';
import { TotoAPI } from "./TotoAPI";

/**
 * API class for the Home Dashboard of the Language Learning module.
 * Wraps the tome-ms-language backend.
 *
 * Endpoint mapping (basepath handled by NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT):
 *   - GET /me                        → user profile (id, email, cefrLevel)
 *   - GET /me/progress               → level info + modules at current level
 *   - GET /me/stats/dailyActivity    → per-day activity counts for rolling 7-day window
 */
export class TomeLearningDashboardAPI {

    /**
     * Fetches the authenticated user's profile.
     * Returns the user's internal ID, email, and current CEFR level.
     * The userId is required when calling user-scoped endpoints such as
     * POST /users/:userId/modules/:moduleId/practiceSessions.
     *
     * Endpoint: GET /me
     */
    async getMe(): Promise<MeResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', '/me')).json();
    }

    /**
     * Fetches the user's full progress view.
     * Returns the current CEFR level, a status summary for all 6 levels, and
     * the per-module status list for the viewed level (defaults to current level).
     *
     * Endpoint: GET /me/progress
     */
    async getMeProgress(cefrLevel?: string): Promise<MeProgressResponse> {
        const query = cefrLevel ? `?cefrLevel=${cefrLevel}` : '';
        return (await new TotoAPI().fetch('tome-ms-language', `/me/progress${query}`)).json();
    }

    /**
     * Fetches per-day activity counts for the rolling 7-day window ending today
     * (last 6 days + today). Computes `from` as today − 6 days.
     *
     * Endpoint: GET /me/stats/dailyActivity?from=YYYYMMDD
     */
    async getWeeklySessionStats(): Promise<WeeklySessionStatsResponse> {
        const from = getRollingWindowStart();
        return (await new TotoAPI().fetch('tome-ms-language', `/me/stats/dailyActivity?from=${from}`)).json();
    }
}

// ─── Raw API response types (matching tome-ms-language exactly) ────────────

export interface MeResponse {
    /** The user's internal database ID — required for user-scoped endpoints */
    id: string;
    email: string;
    cefrLevel: string;
    createdAt: string;
}

export interface MeProgressResponse {
    /** The user's current CEFR level, e.g. "A1" */
    currentCefrLevel: CefrLevel;
    /** Status summary for every CEFR level */
    levels: LevelSummary[];
    /**
     * Per-module entries for the viewed level
     * (defaults to current level when no cefrLevel query param is provided).
     */
    modules: ModuleProgressEntry[];
}

export interface LevelSummary {
    level: CefrLevel;
    status: 'locked' | 'current' | 'completed';
    modulesCompleted: number;
    modulesTotal: number;
}

export interface ModuleProgressEntry {
    moduleId: string;
    title: string;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    step: 'grammar' | 'practice' | 'test' | 'done' | null;
    completionPct: number;
    startedAt: string | null;
    completedAt: string | null;
    testUnlocksAt: string | null;
    testRetryAvailableAt: string | null;
    vocabularyItemsPracticedCount: number;      // Number of unique vocabulary items encountered across all practice sessions for this module
}

export interface WeeklySessionStatsResponse {
    /** First day of the 7-day window in YYYYMMDD format (= today − 6). */
    from: string;
    /** Last day of the window in YYYYMMDD format (= today). */
    to: string;
    /** Seven entries, oldest → today, one per day in the rolling window. */
    days: DailyActivityDay[];
}

export interface DailyActivityDay {
    /** Date in YYYYMMDD format */
    date: string;
    /** Completed practice sessions on this day */
    practiceSessions: number;
    /** Passed module tests on this day */
    successfulModuleTests: number;
    /** Passed level tests on this day */
    successfulLevelTests: number;
}

// ─── Frontend-facing derived types (built from the raw API data) ───────────

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Human-readable name for each CEFR level, used in the Level Track component. */
export const CEFR_LEVEL_NAMES: Record<CefrLevel, string> = {
    A1: 'Foundation',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Mastery',
};

/** Shape expected by the ContinueCard component. Derived from MeProgressResponse. */
export interface CurrentModuleInfo {
    /** Module ID */
    id: string;
    /** Module title, e.g. "Who Are You?" */
    title: string;
    /** CEFR level of the module */
    cefrLevel: CefrLevel;
    /** 1-based index of the module within its level */
    moduleIndex: number;
    /** User's status for this module */
    status: 'available' | 'in_progress';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the start of the rolling 7-day window (today − 6 days) in YYYYMMDD format.
 * Used as `from` for GET /me/stats/dailyActivity so the window ends on today.
 */
function getRollingWindowStart(): string {
    return moment().subtract(6, 'days').format('YYYYMMDD');
}

/**
 * Derives the current module to display in the Continue CTA from a
 * MeProgressResponse.  Returns the first `in_progress` module, falling back
 * to the first `available` module; returns null when none exists.
 */
export function deriveCurrentModule(progress: MeProgressResponse): CurrentModuleInfo | null {
    const modules = progress.modules;

    const candidate =
        modules.find(m => m.status === 'in_progress') ??
        modules.find(m => m.status === 'available') ??
        null;

    if (!candidate) return null;

    const moduleIndex = modules.indexOf(candidate) + 1;

    return {
        id: candidate.moduleId,
        title: candidate.title,
        cefrLevel: progress.currentCefrLevel,
        moduleIndex,
        status: candidate.status as 'available' | 'in_progress',
    };
}
