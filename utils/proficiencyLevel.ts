/**
 * Maps a User Proficiency Score (UPS, 0-100) to the four-level signal-strength
 * tier shown on completed modules in the module map. Thresholds are tuned to
 * be diagnostic rather than celebratory — level 4 means "genuinely nailed it".
 *
 * - Level 4 ("Nailed it"): score >= 80
 * - Level 3 ("Solid"): 65 <= score < 80
 * - Level 2 ("Shaky — worth a revisit"): 50 <= score < 65
 * - Level 1 ("Struggled — revise this"): score < 50
 *
 * @param {number} score - The module's `proficiency.score` (0-100).
 *
 * @returns {1 | 2 | 3 | 4} The signal level, 1 (weakest) to 4 (strongest).
 */
export function getProficiencyLevel(score: number): 1 | 2 | 3 | 4 {
    if (score >= 80) return 4;
    if (score >= 65) return 3;
    if (score >= 50) return 2;

    return 1;
}
