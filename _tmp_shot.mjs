import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const SHOT_DIR = 'C:/Users/Anderson/AppData/Local/Temp/claude/c--Users-Anderson-Downloads-parku-web/5817af4f-cb51-41f1-b295-8e1ecd656540/scratchpad';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors = [];
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#login-email', 'carlos.lopez@sena.edu.co');
await page.fill('#login-password', 'Pass1234');
await page.click('button[type="submit"]');
await page.waitForTimeout(1200);

await page.click('a[href="/app/parqueaderos"], button:has-text("Parqueaderos")').catch(() => {});
await page.waitForTimeout(500);
// Ensure we're on Parqueaderos page and Map tab
await page.goto(`${BASE}/app/parqueaderos`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.click('button:has-text("Plano")');
await page.waitForTimeout(800);
await page.screenshot({ path: `${SHOT_DIR}/map-current-full.png`, fullPage: false });

// Zoom into map area only
const mapBox = await page.locator('svg').first().boundingBox();
console.log('mapBox', mapBox);
if (mapBox) {
  await page.screenshot({ path: `${SHOT_DIR}/map-current-crop.png`, clip: { x: mapBox.x, y: mapBox.y, width: Math.min(mapBox.width, 1400), height: Math.min(mapBox.height, 700) } });
}

console.log('ERRORS:', JSON.stringify(errors));
await browser.close();
