import { seededShuffle } from '../utils/seededShuffle';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Runs `seededShuffle` over many distinct seeds and returns, for each index,
 * how many times the original first element ([0]) ended up at that index.
 */
function distributionOfFirstElement<T>(arr: T[], seeds: string[]): number[] {
    const counts = new Array(arr.length).fill(0);

    for (const seed of seeds) {
        const shuffled = seededShuffle(arr, seed);
        const pos = shuffled.indexOf(arr[0]);
        counts[pos] += 1;
    }

    return counts;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('seededShuffle', () => {

    it('is deterministic — the same seed always yields the same order', () => {
        const arr = ['a', 'b', 'c', 'd'];

        const first = seededShuffle(arr, 'exercise-123');
        const second = seededShuffle(arr, 'exercise-123');

        expect(second).toEqual(first);
    });

    it('does not mutate the input array', () => {
        const arr = ['a', 'b', 'c', 'd'];

        seededShuffle(arr, 'exercise-123');

        expect(arr).toEqual(['a', 'b', 'c', 'd']);
    });

    it('returns a true permutation — same elements, none lost or duplicated', () => {
        const arr = ['a', 'b', 'c', 'd'];

        const shuffled = seededShuffle(arr, 'some-seed');

        expect([...shuffled].sort()).toEqual([...arr].sort());
    });

    it('does NOT always push the first element to the last position (the bug)', () => {
        const arr = ['answer', 'd1', 'd2', 'd3'];
        const seeds = Array.from({ length: 200 }, (_, i) => `exercise-${i}`);

        const counts = distributionOfFirstElement(arr, seeds);

        // The buggy implementation always placed [0] at the last index.
        // The correct answer must be able to land anywhere, so the last index
        // must not capture every single run.
        expect(counts[arr.length - 1]).toBeLessThan(seeds.length);
    });

    it('places the first element in every position across many seeds (roughly uniform)', () => {
        const arr = ['answer', 'd1', 'd2', 'd3'];
        const seeds = Array.from({ length: 400 }, (_, i) => `exercise-${i}`);

        const counts = distributionOfFirstElement(arr, seeds);

        // Every position should be reached at least once...
        for (const count of counts) {
            expect(count).toBeGreaterThan(0);
        }

        // ...and no position should dominate (uniform would be 25%; allow slack).
        for (const count of counts) {
            expect(count).toBeLessThan(seeds.length * 0.45);
        }
    });

    it('handles edge cases — empty and single-element arrays', () => {
        expect(seededShuffle([], 'seed')).toEqual([]);
        expect(seededShuffle(['only'], 'seed')).toEqual(['only']);
    });
});
