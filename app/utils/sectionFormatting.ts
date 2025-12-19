/**
 * Format section code to human-readable form
 * - Replace hyphens with spaces
 * - Capitalize each word
 * - Convert roman numerals to uppercase
 */
export const formatSectionCode = (code: string): string => {
    return code
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => {
            // Check if the word is a roman numeral (contains only i, v, x, l, c, d, m)
            if (/^[ivxlcdm]+$/.test(word)) {
                return word.toUpperCase();
            }
            // Otherwise, capitalize first letter and keep the rest as is
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
};
