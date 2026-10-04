/**
 * Generates the PWA icons that are derived from the full-bleed master icon (public/logo512.png).
 *
 * Outputs:
 * - public/icon-macos-512.png, public/icon-macos-192.png: manifest icons with purpose "any".
 *   The artwork is cut into the macOS rounded-square ("squircle") shape and sits on a transparent canvas
 *   following the macOS app icon grid (body = 824/1024 of the canvas). Chrome builds the macOS dock icon
 *   from these; macOS 26+ puts icons that don't follow this shape on a grey tile.
 * - public/apple-touch-icon.png: 180x180, opaque, for Safari "Add to Dock" and iOS home screen.
 *
 * public/logo192.png and public/logo512.png are the full-bleed "maskable" icons and are not touched.
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const MASTER_ICON = path.join(PUBLIC_DIR, 'logo512.png');

const MACOS_BODY_RATIO = 824 / 1024;      // Size of the icon body relative to the canvas, per the macOS app icon grid.
const SQUIRCLE_EXPONENT = 5;              // Superellipse exponent approximating the macOS continuous-corner rounded square.
const SQUIRCLE_POINTS = 720;              // Number of points used to draw the superellipse outline.
const BRAND_COLOR = '#00acc1';            // Tome theme colour, used to flatten the Apple touch icon.

/**
 * Builds an SVG of a filled superellipse that fills a square of the given size.
 *
 * @param {number} size - the side of the square, in pixels
 *
 * @returns {Buffer} the SVG, ready to be used as a sharp input
 */
function squircleSvg(size) {

    const half = size / 2;
    const points = [];

    for (let i = 0; i < SQUIRCLE_POINTS; i++) {

        const t = (2 * Math.PI * i) / SQUIRCLE_POINTS;
        const cos = Math.cos(t);
        const sin = Math.sin(t);
        const x = half + half * Math.sign(cos) * Math.pow(Math.abs(cos), 2 / SQUIRCLE_EXPONENT);
        const y = half + half * Math.sign(sin) * Math.pow(Math.abs(sin), 2 / SQUIRCLE_EXPONENT);

        points.push(`${x.toFixed(3)},${y.toFixed(3)}`);
    }

    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><polygon points="${points.join(' ')}" fill="#fff"/></svg>`);
}

/**
 * Renders the master icon as a macOS-shaped icon: scaled to the icon body, cut into a squircle and centred on a transparent canvas.
 *
 * @param {number} canvasSize - the side of the output canvas, in pixels
 *
 * @returns {Promise<Buffer>} the PNG
 */
async function macosIcon(canvasSize) {

    const bodySize = Math.round(canvasSize * MACOS_BODY_RATIO);
    const margin = Math.floor((canvasSize - bodySize) / 2);

    const body = await sharp(MASTER_ICON).resize(bodySize, bodySize).composite([{ input: squircleSvg(bodySize), blend: 'dest-in' }]).png().toBuffer();

    return sharp(body).extend({ top: margin, left: margin, bottom: canvasSize - bodySize - margin, right: canvasSize - bodySize - margin, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

/**
 * Generates all derived icons into public/.
 */
async function main() {

    await sharp(await macosIcon(512)).toFile(path.join(PUBLIC_DIR, 'icon-macos-512.png'));

    await sharp(await macosIcon(192)).toFile(path.join(PUBLIC_DIR, 'icon-macos-192.png'));

    await sharp(MASTER_ICON).resize(180, 180).flatten({ background: BRAND_COLOR }).removeAlpha().png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));

    console.log('PWA icons generated in public/');
}

main();
