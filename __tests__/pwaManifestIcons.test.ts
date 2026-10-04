import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Guards the PWA icons declared in app/manifest.json.
 *
 * macOS 26+ shrinks app icons that don't fill its rounded-square shape onto a grey tile.
 * Chrome builds the macOS dock icon from the manifest, so the "any" icons must already
 * carry the macOS shape (transparent corners), while "maskable" icons stay full-bleed
 * for platforms that apply their own mask (Android).
 */

interface ManifestIcon {
    src: string;            // Path of the icon, relative to the site root.
    sizes: string;          // Space-separated list of declared sizes, e.g. "512x512".
    type: string;           // MIME type of the icon.
    purpose?: string;       // Space-separated purposes ("any", "maskable"). Defaults to "any" when missing.
}

const ROOT = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/manifest.json'), 'utf-8'));
const icons: ManifestIcon[] = manifest.icons;
const pngIcons = icons.filter(icon => icon.type === 'image/png');

/**
 * Resolves a manifest icon src to a file on disk.
 * Next serves files from public/ at the site root, and app/favicon.ico through its file convention.
 *
 * @param {string} src - the icon src as declared in the manifest
 *
 * @returns {string | undefined} the absolute path of the file, if found
 */
function resolveIconFile(src: string): string | undefined {

    const candidates = [path.join(ROOT, 'public', src), path.join(ROOT, 'app', src)];

    return candidates.find(candidate => fs.existsSync(candidate));
}

/**
 * Reads the alpha value of a single pixel of a PNG.
 *
 * @param {string} file - the PNG file
 * @param {number} x - the pixel column
 * @param {number} y - the pixel row
 *
 * @returns {Promise<number>} the alpha value (0 = transparent, 255 = opaque)
 */
async function alphaAt(file: string, x: number, y: number): Promise<number> {

    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    return data[(y * info.width + x) * info.channels + 3];
}

describe('PWA manifest icons', () => {

    it('declares every icon with a single purpose, never "any maskable" combined', () => {
        const combined = icons.filter(icon => (icon.purpose ?? 'any').trim().split(/\s+/).length > 1);

        expect(combined).toEqual([]);
    });

    it('declares a 512x512 PNG for purpose "any"', () => {
        const any512 = pngIcons.find(icon => icon.purpose === 'any' && icon.sizes === '512x512');

        expect(any512).toBeDefined();
    });

    it('declares a 512x512 PNG for purpose "maskable"', () => {
        const maskable512 = pngIcons.find(icon => icon.purpose === 'maskable' && icon.sizes === '512x512');

        expect(maskable512).toBeDefined();
    });

    it.each(icons.map(icon => [icon.src]))('serves a file for %s', (src) => {
        expect(resolveIconFile(src)).toBeDefined();
    });

    it.each(pngIcons.map(icon => [icon.src, icon.sizes]))('%s has the declared size %s', async (src, sizes) => {
        const { width, height } = await sharp(resolveIconFile(src)!).metadata();

        expect(`${width}x${height}`).toBe(sizes);
    });

    it.each(pngIcons.filter(icon => icon.purpose === 'any').map(icon => [icon.src]))('"any" icon %s has transparent corners (macOS rounded shape)', async (src) => {
        const file = resolveIconFile(src)!;

        expect(await alphaAt(file, 0, 0)).toBe(0);
    });

    it.each(pngIcons.filter(icon => icon.purpose === 'any').map(icon => [icon.src]))('"any" icon %s is opaque in the centre', async (src) => {
        const file = resolveIconFile(src)!;
        const { width, height } = await sharp(file).metadata();

        expect(await alphaAt(file, Math.floor(width! / 2), Math.floor(height! / 4))).toBe(255);
    });

    it.each(pngIcons.filter(icon => icon.purpose === 'maskable').map(icon => [icon.src]))('"maskable" icon %s is full-bleed (opaque corners)', async (src) => {
        const file = resolveIconFile(src)!;

        expect(await alphaAt(file, 0, 0)).toBe(255);
    });
});
