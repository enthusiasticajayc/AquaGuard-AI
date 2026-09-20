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

async function audit() {
  const browser = await chromium.launch();
  const beforeDir = path.resolve('screenshots/before_responsive');
  if (!fs.existsSync(beforeDir)) {
    fs.mkdirSync(beforeDir, { recursive: true });
  }

  console.log('====================================================');
  console.log('  STARTING MULTI-VIEWPORT RESPONSIVE AUDIT (1440, 1024, 375)');
  console.log('====================================================\n');

  for (const vp of viewports) {
    console.log(`\n--- VIEWPORT: ${vp.label} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const r of routes) {
      await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // Check for horizontal overflow / scrollbar
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      const shotPath = path.join(beforeDir, `${r.name}_${vp.label}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });

      if (overflow) {
        console.log(`  ❌ OVERFLOW DEFECT: [${vp.label}] ${r.path} has horizontal scrollbar (${r.name}_${vp.label}.png)`);
      } else {
        console.log(`  ✓ [${vp.label}] ${r.path} fits viewport width clean.`);
      }
    }

    await context.close();
  }

  await browser.close();
}

audit().catch(console.error);
