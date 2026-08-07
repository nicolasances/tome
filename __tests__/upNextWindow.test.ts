import { computeUpNextWindow } from '../utils/upNextWindow';
import { ModuleProgressEntry } from '../api/TomeLearningDashboardAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function module(id: string, status: ModuleProgressEntry['status']): ModuleProgressEntry {
    return {
        moduleId: id,
        title: `Module ${id}`,
        status,
        step: null,
        completionPct: 0,
        startedAt: null,
        completedAt: null,
        testUnlocksAt: null,
        testRetryAvailableAt: null,
        vocabularyItemsPracticedCount: 0,
        currentRung: 1,
        currentRungCoverage: { coveredCount: 0, totalCount: 0 },
        fullyCompletedRungs: 0,
    };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('computeUpNextWindow', () => {

    it('windows around an in_progress module in the middle of a 9-module level', () => {
        const modules = [
            module('m1', 'completed'),
            module('m2', 'completed'),
            module('m3', 'completed'),
            module('m4', 'completed'),
            module('m5', 'completed'),
            module('m6', 'in_progress'),
            module('m7', 'locked'),
            module('m8', 'locked'),
            module('m9', 'locked'),
        ];

        const result = computeUpNextWindow(modules);

        expect(result.map((e) => e.levelIndex)).toEqual([5, 6, 7, 8]);
        expect(result.map((e) => e.module.moduleId)).toEqual(['m5', 'm6', 'm7', 'm8']);
    });

    it('windows the last 4 modules when the current module is the last one in the level', () => {
        const modules = [
            module('m1', 'completed'),
            module('m2', 'completed'),
            module('m3', 'completed'),
            module('m4', 'completed'),
            module('m5', 'completed'),
            module('m6', 'in_progress'),
        ];

        const result = computeUpNextWindow(modules);

        expect(result.map((e) => e.levelIndex)).toEqual([3, 4, 5, 6]);
        expect(result.map((e) => e.module.moduleId)).toEqual(['m3', 'm4', 'm5', 'm6']);
    });

    it('windows the first 4 modules when the current module is the first one in the level', () => {
        const modules = [
            module('m1', 'in_progress'),
            module('m2', 'locked'),
            module('m3', 'locked'),
            module('m4', 'locked'),
            module('m5', 'locked'),
        ];

        const result = computeUpNextWindow(modules);

        expect(result.map((e) => e.levelIndex)).toEqual([1, 2, 3, 4]);
        expect(result.map((e) => e.module.moduleId)).toEqual(['m1', 'm2', 'm3', 'm4']);
    });

    it('shows the whole level when it has fewer than 4 modules', () => {
        const modules = [
            module('m1', 'in_progress'),
            module('m2', 'locked'),
            module('m3', 'locked'),
        ];

        const result = computeUpNextWindow(modules);

        expect(result.map((e) => e.levelIndex)).toEqual([1, 2, 3]);
        expect(result.map((e) => e.module.moduleId)).toEqual(['m1', 'm2', 'm3']);
    });

    it('falls back to the last module as current when the whole level is completed', () => {
        const modules = [
            module('m1', 'completed'),
            module('m2', 'completed'),
            module('m3', 'completed'),
            module('m4', 'completed'),
            module('m5', 'completed'),
            module('m6', 'completed'),
        ];

        const result = computeUpNextWindow(modules);

        expect(result.map((e) => e.levelIndex)).toEqual([3, 4, 5, 6]);
        expect(result.map((e) => e.module.moduleId)).toEqual(['m3', 'm4', 'm5', 'm6']);
    });

    it('treats an available module as current when no module is in_progress', () => {
        const modules = [
            module('m1', 'completed'),
            module('m2', 'completed'),
            module('m3', 'completed'),
            module('m4', 'available'),
            module('m5', 'locked'),
            module('m6', 'locked'),
        ];

        const result = computeUpNextWindow(modules);

        expect(result.map((e) => e.levelIndex)).toEqual([3, 4, 5, 6]);
        expect(result.map((e) => e.module.moduleId)).toEqual(['m3', 'm4', 'm5', 'm6']);
    });

    it('returns an empty array for an empty level', () => {
        expect(computeUpNextWindow([])).toEqual([]);
    });
});
