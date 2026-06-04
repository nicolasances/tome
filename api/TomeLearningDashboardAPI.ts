import { TotoAPI } from "./TotoAPI";

/**
 * API class for the Home Dashboard of the Language Learning module.
 * Wraps the tome-ms-language backend for all dashboard-specific data:
 *   - User's current CEFR level + module progress
 *   - Current (in-progress or first-available) module
 *   - Weekly module completion stats
 */
export class TomeLearningDashboardAPI {

    /**
     * Fetches the user's current CEFR level and module progress at that level.
     * Returns level name, total modules, and how many have been completed.
     */
    async getUserLevelProgress(): Promise<UserLevelProgressResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/users/me/level-progress`)).json();
    }

    /**
     * Fetches the current module for the user.
     * Returns the module that is `in_progress`, or the first `available` (not-yet-completed,
     * unlocked) module at the user's current level if none is in progress.
     * Returns null body (404) when no module is available at all.
     */
    async getCurrentModule(): Promise<CurrentModuleResponse | null> {
        const response = await new TotoAPI().fetch('tome-ms-language', `/users/me/modules/current`);
        if (response.status === 404) return null;
        return response.json();
    }

    /**
     * Fetches the number of modules completed per day for the current calendar week (Mon–Sun).
     * Days with no completions are included with count: 0.
     */
    async getWeeklyModuleStats(): Promise<WeeklyModuleStatsResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/users/me/stats/weekly`)).json();
    }
}

// ─── Response types ────────────────────────────────────────────────────────

export interface UserLevelProgressResponse {
    /** Current CEFR level, e.g. "A1" */
    cefrLevel: CefrLevel;
    /** Human-readable level name, e.g. "Foundation" */
    levelName: string;
    /** Total number of modules at the current level */
    totalModules: number;
    /** Number of completed modules at the current level */
    completedModules: number;
}

export interface CurrentModuleResponse {
    /** Module ID */
    id: string;
    /** Module title, e.g. "Who Are You?" */
    title: string;
    /** CEFR level of the module, e.g. "A1" */
    cefrLevel: CefrLevel;
    /** 1-based sequence number of the module within its level, e.g. 1 */
    moduleIndex: number;
    /** User's status for this module */
    status: 'available' | 'in_progress';
}

export interface WeeklyModuleStatsResponse {
    /** Seven entries, one per day of the current calendar week, Mon → Sun */
    days: WeekDayStat[];
}

export interface WeekDayStat {
    /** Date in YYYYMMDD format */
    date: string;
    /** Day label, e.g. "M", "T", "W" */
    label: string;
    /** Number of modules completed on this day */
    count: number;
}

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
