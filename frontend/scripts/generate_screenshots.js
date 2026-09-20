import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const routes = [
  { path: '/', name: 'landing' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/analyze', name: 'analyze' },
  { path: '/surveys/surv-mumbai-001', name: 'detection_viewer' },
  { path: '/map', name: 'gis_map' },
  { path: '/verify', name: 'verification_queue' },
  { path: '/reports', name: 'reports' },
  { path: '/research', name: 'research' }
];

const viewports = [
  { width: 1440, height: 900, label: '1440px' },
  { width: 375, height: 812, label: '375px' }
];

const themes = ['light', 'dark'];

async function captureScreenshots() {
  const outputDir = path.resolve('screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });

    for (const theme of themes) {
      for (const r of routes) {
        const page = await context.newPage();
        await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle' });

        await page.evaluate((t) => {
          if (t === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }, theme);

        await page.waitForTimeout(300);

        const screenshotPath = path.join(outputDir, `${r.name}_${theme}_${vp.label}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`Captured: ${screenshotPath}`);
        await page.close();
      }
    }
    await context.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

captureScreenshots().catch(console.error);
