/**
 * Deterministically shuffles an array using a seeded Fisher–Yates algorithm.
 *
 * The shuffle is fully determined by the seed: the same array and seed always
 * produce the same ordering. This keeps option ordering stable across re-renders
 * within a session (no flicker) while still distributing elements across all
 * positions roughly uniformly over many different seeds.
 *
 * Implementation notes:
 * - A 32-bit hash is derived from the seed string (FNV-style mixing).
 * - The hash drives a mulberry32 PRNG, which yields a fresh pseudo-random value
 *   on each iteration. This is what the previous implementation lacked: it used
 *   `(hash * (i + 1)) % (i + 1)`, which is always `0`, so the swap target never
 *   varied and element 0 was deterministically pushed to the last position.
 *
 * @param {T[]} arr - The array to shuffle. It is not mutated; a copy is returned.
 * @param {string} seed - The seed driving the deterministic shuffle.
 *
 * @returns {T[]} A new array containing the same elements in a shuffled order.
 */
export function seededShuffle<T>(arr: T[], seed: string): T[] {

    const copy = [...arr];
    const random = mulberry32(hashSeed(seed));

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

/**
 * Derives a 32-bit unsigned integer hash from a seed string.
 *
 * Uses the FNV-1a mixing approach so that small changes in the seed (e.g.
 * consecutive exercise ids) produce well-spread hash values.
 *
 * @param {string} seed - The seed string to hash.
 *
 * @returns {number} A 32-bit unsigned integer hash.
 */
function hashSeed(seed: string): number {

    let hash = 2166136261;

    for (let i = 0; i < seed.length; i++) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

/**
 * mulberry32 PRNG: a small, fast 32-bit pseudo-random number generator.
 *
 * Returns a function that, on each call, produces the next pseudo-random number
 * in [0, 1) derived deterministically from the initial state.
 *
 * @param {number} state - The initial 32-bit state (the seed hash).
 *
 * @returns {() => number} A function yielding the next pseudo-random number in [0, 1).
 */
function mulberry32(state: number): () => number {

    return function () {

        state |= 0;
        state = (state + 0x6d2b79f5) | 0;

        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
