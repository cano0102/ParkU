import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const SHOT_DIR = 'C:/Users/Anderson/AppData/Local/Temp/claude/c--Users-Anderson-Downloads-parku-web/5817af4f-cb51-41f1-b295-8e1ecd656540/scratchpad';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('#login-email', 'carlos.lopez@sena.edu.co');
await page.fill('#login-password', 'Pass1234');
await page.click('button[type="submit"]');
await page.waitForTimeout(1200);
await page.goto(`${BASE}/app/parqueaderos`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.click('button:has-text("Plano")');
await page.waitForTimeout(800);

// Zoom in with the map's own zoom button a couple times for a closer look
for (let i = 0; i < 3; i++) {
  await page.click('button[title="Acercar"]');
  await page.waitForTimeout(150);
}
await page.waitForTimeout(400);
await page.screenshot({ path: `${SHOT_DIR}/map-zoomed.png` });

// Hover a cell to see tooltip
const box = await page.locator('.pq-content-grid, svg').first().boundingBox();
await page.mouse.move(400, 420);
await page.waitForTimeout(400);
await page.screenshot({ path: `${SHOT_DIR}/map-hover.png` });

await browser.close();
