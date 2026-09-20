import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const routes = [
  { path: '/', name: 'landing' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/analyze', name: 'analyze' },
  { path: '/surveys/surv-mumbai-001', name: 'detection_viewer' },
  { path: '/map', name: 'map' },
  { path: '/verify', name: 'verify' },
  { path: '/reports', name: 'reports' },
  { path: '/research', name: 'research' }
];

const viewports = [
  { width: 1440, height: 900, label: '1440px' },
  { width: 1024, height: 768, label: '1024px' },
  { width: 375, height: 812, label: '375px' }
];

async function generateAfter() {
  const browser = await chromium.launch();
  const afterDir = path.resolve('screenshots/after_responsive');
  if (!fs.existsSync(afterDir)) {
    fs.mkdirSync(afterDir, { recursive: true });
  }

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const r of routes) {
      await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      const shotPath = path.join(afterDir, `${r.name}_${vp.label}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`Captured verified screenshot: ${shotPath}`);
    }

    await context.close();
  }

  await browser.close();
}

generateAfter().catch(console.error);
