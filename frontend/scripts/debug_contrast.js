import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/dashboard',
  '/analyze',
  '/surveys/surv-mumbai-001',
  '/map',
  '/verify',
  '/reports',
  '/research'
];

async function runAudit() {
  const browser = await chromium.launch();

  for (const r of routes) {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(`http://localhost:5173${r}`, { waitUntil: 'networkidle' });

    for (const mode of ['light', 'dark']) {
      await page.evaluate((m) => {
        if (m === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }, mode);
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      if (results.violations.length > 0) {
        console.log(`\n❌ [${mode.toUpperCase()}] ${r} - ${results.violations.length} Contrast Violations:`);
        for (const v of results.violations) {
          for (const node of v.nodes) {
            console.log(`  Selector: ${node.target.join(' ')}`);
            console.log(`  Message: ${node.failureSummary.split('\n')[0]}`);
          }
        }
      } else {
        console.log(`\n✅ [${mode.toUpperCase()}] ${r} - PASS (Zero contrast violations)`);
      }
    }

    await context.close();
  }

  await browser.close();
}

runAudit().catch(console.error);
