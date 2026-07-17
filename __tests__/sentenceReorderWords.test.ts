import { tagWords, toggleWordId, resolveBuiltWords } from '../utils/sentenceReorderWords';

describe('tagWords', () => {

    it('tags each word with its index as id', () => {
        const result = tagWords(['Jeg', 'spiser', 'fisk']);

        expect(result).toEqual([
            { id: 0, text: 'Jeg' },
            { id: 1, text: 'spiser' },
            { id: 2, text: 'fisk' },
        ]);
    });

    it('gives duplicate words distinct ids', () => {
        const result = tagWords(['spiser', 'ikke', 'spiser']);

        expect(result[0]).toEqual({ id: 0, text: 'spiser' });
        expect(result[2]).toEqual({ id: 2, text: 'spiser' });
    });

    it('returns an empty array for an empty input', () => {
        const result = tagWords([]);

        expect(result).toEqual([]);
    });

});

describe('toggleWordId', () => {

    it('appends an id that is not yet built', () => {
        const result = toggleWordId([0, 2], 1);

        expect(result).toEqual([0, 2, 1]);
    });

    it('removes an id that is already built', () => {
        const result = toggleWordId([0, 1, 2], 1);

        expect(result).toEqual([0, 2]);
    });

    it('only removes the clicked instance of a duplicated word, not every occurrence sharing its text', () => {
        // "spiser" appears at id 1 and id 4 — both are built, only id 1 is toggled off
        const built = [1, 2, 4];

        const result = toggleWordId(built, 1);

        expect(result).toEqual([2, 4]);
    });

    it('does not mutate the input array', () => {
        const built = [0, 1];

        toggleWordId(built, 2);

        expect(built).toEqual([0, 1]);
    });

});

describe('resolveBuiltWords', () => {

    it('maps built ids back to their word text in order', () => {
        const words = ['Jeg', 'spiser', 'ikke', 'kød'];

        const result = resolveBuiltWords(words, [1, 0, 2, 3]);

        expect(result).toEqual(['spiser', 'Jeg', 'ikke', 'kød']);
    });

    it('reconstructs a sentence containing a duplicated word correctly', () => {
        // "Jeg spiser ikke kød, men jeg spiser fisk" — "spiser" at index 1 and 6
        const words = ['Jeg', 'spiser', 'ikke', 'kød,', 'men', 'jeg', 'spiser', 'fisk'];

        const result = resolveBuiltWords(words, [0, 1, 2, 3, 4, 5, 6, 7]);

        expect(result).toEqual(['Jeg', 'spiser', 'ikke', 'kød,', 'men', 'jeg', 'spiser', 'fisk']);
    });

    it('returns an empty array when no ids are built', () => {
        const result = resolveBuiltWords(['a', 'b'], []);

        expect(result).toEqual([]);
    });

});
