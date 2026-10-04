import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Guards the Apple touch icon, used by Safari "Add to Dock" on macOS and by the iOS home screen.
 *
 * app/layout.tsx links /apple-touch-icon.png, so that file must exist in public/.
 * Next.js would also inject its own link for app/apple-icon.png, which would compete with it.
 */

const ROOT = path.join(__dirname, '..');
const APPLE_TOUCH_ICON = path.join(ROOT, 'public/apple-touch-icon.png');

describe('Apple touch icon', () => {

    it('is linked from the root layout as /apple-touch-icon.png', () => {
        const layout = fs.readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf-8');

        expect(layout).toMatch(/<link rel="apple-touch-icon" href="\/apple-touch-icon.png" \/>/);
    });

    it('exists in public/', () => {
        expect(fs.existsSync(APPLE_TOUCH_ICON)).toBe(true);
    });

    it('is 180x180, the size iOS expects', async () => {
        const { width, height } = await sharp(APPLE_TOUCH_ICON).metadata();

        expect(`${width}x${height}`).toBe('180x180');
    });

    it('has no transparency (iOS renders transparent areas black)', async () => {
        const { hasAlpha } = await sharp(APPLE_TOUCH_ICON).metadata();

        expect(hasAlpha).toBe(false);
    });

    it('is not shadowed by an outdated app/apple-icon.png injected by Next.js', () => {
        expect(fs.existsSync(path.join(ROOT, 'app/apple-icon.png'))).toBe(false);
    });
});
