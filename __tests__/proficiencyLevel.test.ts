import { getProficiencyLevel } from '../utils/proficiencyLevel';

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('getProficiencyLevel', () => {

    it('returns level 4 for a score of 80 (lower bound of "nailed it")', () => {
        expect(getProficiencyLevel(80)).toEqual(4);
    });

    it('returns level 4 for a score of 95', () => {
        expect(getProficiencyLevel(95)).toEqual(4);
    });

    it('returns level 3 for a score of 79 (just under the level-4 threshold)', () => {
        expect(getProficiencyLevel(79)).toEqual(3);
    });

    it('returns level 3 for a score of 65 (lower bound of "solid")', () => {
        expect(getProficiencyLevel(65)).toEqual(3);
    });

    it('returns level 2 for a score of 64 (just under the level-3 threshold)', () => {
        expect(getProficiencyLevel(64)).toEqual(2);
    });

    it('returns level 2 for a score of 50 (lower bound of "shaky")', () => {
        expect(getProficiencyLevel(50)).toEqual(2);
    });

    it('returns level 1 for a score of 49 (just under the level-2 threshold)', () => {
        expect(getProficiencyLevel(49)).toEqual(1);
    });

    it('returns level 1 for a score of 0', () => {
        expect(getProficiencyLevel(0)).toEqual(1);
    });
});
