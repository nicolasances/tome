import moment from 'moment';
import { TotoAPI } from "./TotoAPI";

/**
 * API class for the Home Dashboard of the Language Learning module.
 * Wraps the tome-ms-language backend.
 *
 * Endpoint mapping (basepath handled by NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT):
 *   - GET /me/progress               → level info + modules at current level
 *   - GET /sessions/stats/weekly     → session counts per day for current week
 */
export class TomeLearningDashboardAPI {

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
     * Fetches completed session counts per day for the current calendar week (Mon–Sun).
     * Computes the Monday of the current week and passes it as the required `from` param.
     *
     * Endpoint: GET /sessions/stats/weekly?from=YYYYMMDD
     * `from` must be a Monday in YYYYMMDD format.
     */
    async getWeeklySessionStats(): Promise<WeeklySessionStatsResponse> {
        const from = getMondayOfCurrentWeek();
        return (await new TotoAPI().fetch('tome-ms-language', `/sessions/stats/weekly?from=${from}`)).json();
    }
}

// ─── Raw API response types (matching tome-ms-language exactly) ────────────

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
}

export interface WeeklySessionStatsResponse {
    /** Seven entries, Mon → Sun, with date (YYYYMMDD) and completed-session count. */
    days: WeeklyStatDay[];
}

export interface WeeklyStatDay {
    /** Date in YYYYMMDD format */
    date: string;
    /** Number of sessions completed on this day */
    count: number;
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
 * Returns the Monday of the current calendar week in YYYYMMDD format.
 * Required by GET /sessions/stats/weekly.
 */
function getMondayOfCurrentWeek(): string {
    return moment().startOf('isoWeek').format('YYYYMMDD');
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
