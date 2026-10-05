/**
 * Generates the PWA icons that are derived from the full-bleed master icon (public/logo512.png).
 *
 * Outputs:
 * - public/icon-macos-512.png, public/icon-macos-192.png: manifest icons with purpose "any".
 *   The artwork follows Apple's pre-macOS 26 app icon template: a rounded rectangle inset by 100/1024 with a
 *   184/1024 corner radius, on a transparent canvas, with a soft drop shadow. Chrome copies these unchanged into
 *   the macOS app's app.icns. macOS 26+ puts .icns icons that don't follow this template (shadow included) on a
 *   grey plate (#343). The template values match Chromium's own Apple icon mask (chrome/browser/web_applications/
 *   os_integration/mac/icon_utils.mm).
 * - public/apple-touch-icon.png: 180x180, opaque, for Safari "Add to Dock" and iOS home screen.
 *
 * public/logo512.png is only the source image: it is not declared in the manifest, because Chrome on macOS
 * builds the dock icon from a full-bleed "maskable" icon without rounding it (#343).
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const MASTER_ICON = path.join(PUBLIC_DIR, 'logo512.png');

const TEMPLATE_INSET = 100 / 1024;            // Distance between the canvas edge and the icon body, relative to the canvas.
const TEMPLATE_CORNER_RADIUS = 184 / 1024;    // Corner radius of the icon body, relative to the canvas.
const SHADOW_OFFSET_Y = 10 / 1024;            // Vertical offset of the drop shadow, relative to the canvas.
const SHADOW_BLUR = 10 / 1024;                // Blur radius of the drop shadow, relative to the canvas.
const SHADOW_OPACITY = 77 / 255;              // Opacity of the (black) drop shadow.
const BRAND_COLOR = '#00acc1';                // Tome theme colour, used to flatten the Apple touch icon.

/**
 * Builds the SVG rounded rectangle of the icon body for a canvas of the given size.
 *
 * @param {number} canvasSize - the side of the canvas, in pixels
 *
 * @returns {string} the SVG <rect> element
 */
function bodyRect(canvasSize) {

    const inset = canvasSize * TEMPLATE_INSET;
    const side = canvasSize - 2 * inset;

    return `<rect x="${inset}" y="${inset}" width="${side}" height="${side}" rx="${canvasSize * TEMPLATE_CORNER_RADIUS}"/>`;
}

/**
 * Renders the master icon following Apple's app icon template: scaled to the icon body, cut into a rounded rectangle,
 * centred on a transparent canvas and lifted by a soft drop shadow.
 *
 * @param {number} canvasSize - the side of the output canvas, in pixels
 *
 * @returns {Promise<Buffer>} the PNG
 */
async function macosIcon(canvasSize) {

    const inset = Math.round(canvasSize * TEMPLATE_INSET);
    const bodySize = canvasSize - 2 * inset;

    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}"><g fill="#fff">${bodyRect(canvasSize)}</g></svg>`);
    const shadow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}"><defs><filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${canvasSize * SHADOW_BLUR / 2}"/></filter></defs><g transform="translate(0 ${canvasSize * SHADOW_OFFSET_Y})" filter="url(#blur)" fill="#000" fill-opacity="${SHADOW_OPACITY}">${bodyRect(canvasSize)}</g></svg>`);

    const body = await sharp(MASTER_ICON).resize(bodySize, bodySize).extend({ top: inset, left: inset, bottom: inset, right: inset, background: BRAND_COLOR }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

    return sharp(shadow).composite([{ input: body }]).png().toBuffer();
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
