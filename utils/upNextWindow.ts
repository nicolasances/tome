import { ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';

export interface UpNextEntry {
    module: ModuleProgressEntry;
    /** 1-based position within the level (not the array position within the returned window). */
    levelIndex: number;
}

/**
 * Builds the size-4 sliding window of modules to show in the "Up next" strip,
 * centered on the user's current module (first `in_progress`, else first
 * `available`, else — level fully completed — the level's last module).
 * The window places the current module in its 2nd slot by default (1 before,
 * 2 after), clamped to the level's boundaries, and shrinks to the whole level
 * when it has fewer than 4 modules.
 *
 * @param {ModuleProgressEntry[]} modules - The viewed level's modules, in level order.
 *
 * @returns {UpNextEntry[]} The windowed modules, each tagged with its true 1-based level-relative index.
 */
export function computeUpNextWindow(modules: ModuleProgressEntry[]): UpNextEntry[] {
    if (modules.length === 0) return [];

    const currentIndex =
        modules.findIndex((m) => m.status === 'in_progress') !== -1
            ? modules.findIndex((m) => m.status === 'in_progress')
            : modules.findIndex((m) => m.status === 'available') !== -1
                ? modules.findIndex((m) => m.status === 'available')
                : modules.length - 1;

    const windowSize = Math.min(4, modules.length);

    let start = currentIndex - 1;
    if (start < 0) start = 0;
    if (start + windowSize > modules.length) start = modules.length - windowSize;

    return modules.slice(start, start + windowSize).map((m, i) => ({
        module: m,
        levelIndex: start + i + 1,
    }));
}
