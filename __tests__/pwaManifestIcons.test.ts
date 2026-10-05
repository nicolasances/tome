import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Guards the PWA icons declared in app/manifest.json.
 *
 * macOS 26+ shrinks app icons that don't fill its rounded-square shape onto a grey tile.
 * Chrome builds the macOS dock icon from the manifest, so the "any" icons must already
 * carry the macOS shape (transparent corners). Chrome 154 on macOS was observed to pick
 * the "maskable" icon and copy it in without rounding it (#343), so no "maskable" icons may be declared.
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

    it('declares no "maskable" icons, so Chrome on macOS builds the dock icon from the macOS-shaped "any" icons', () => {
        const maskable = icons.filter(icon => icon.purpose === 'maskable');

        expect(maskable).toEqual([]);
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

    // macOS 26+ only accepts an .icns-only app icon without the grey plate when it follows Apple's
    // pre-26 icon template, drop shadow included (checked on macOS 27 for #343).
    it.each(pngIcons.filter(icon => icon.purpose === 'any').map(icon => [icon.src]))('"any" icon %s has a drop shadow just below the rounded shape', async (src) => {
        const file = resolveIconFile(src)!;
        const { width } = await sharp(file).metadata();
        const bodyBottom = Math.round(width! * 924 / 1024);

        const shadowAlpha = await alphaAt(file, Math.floor(width! / 2), bodyBottom + Math.max(1, Math.round(width! * 4 / 1024)));

        expect(shadowAlpha).toBeGreaterThan(0);
        expect(shadowAlpha).toBeLessThan(255);
    });

    it.each(pngIcons.filter(icon => icon.purpose === 'any').map(icon => [icon.src]))('"any" icon %s is opaque in the centre', async (src) => {
        const file = resolveIconFile(src)!;
        const { width, height } = await sharp(file).metadata();

        expect(await alphaAt(file, Math.floor(width! / 2), Math.floor(height! / 4))).toBe(255);
    });
});
