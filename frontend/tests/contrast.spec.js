import { test, expect } from '@playwright/test';
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

test.describe('WCAG AA Color Contrast Audit', () => {

  routes.forEach((route) => {
    test(`Check WCAG AA contrast on ${route} in Light Mode`, async ({ page }) => {
      await page.goto(`http://localhost:5173${route}`);
      await page.waitForLoadState('networkidle');

      // Enforce light mode (remove dark class)
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
      });
      await page.waitForTimeout(300);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test(`Check WCAG AA contrast on ${route} in Dark Mode`, async ({ page }) => {
      await page.goto(`http://localhost:5173${route}`);
      await page.waitForLoadState('networkidle');

      // Enforce dark mode (add dark class)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      await page.waitForTimeout(300);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

});
