const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, 'qa_screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("1. Capturing Model Performance Empty State on /research...");
  await page.goto('http://localhost:5173/research', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const screenshotA = path.join(outputDir, 'a_model_performance_empty_state.png');
  await page.screenshot({ path: screenshotA, fullPage: false });
  console.log(`Saved screenshot (a) -> ${screenshotA}`);

  console.log("2. Capturing Analyze Form with Checkbox on /analyze...");
  await page.goto('http://localhost:5173/analyze', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const screenshotB = path.join(outputDir, 'b_analyze_form_checkbox.png');
  await page.screenshot({ path: screenshotB, fullPage: false });
  console.log(`Saved screenshot (b) -> ${screenshotB}`);

  console.log("3. Capturing GIS Map Class Filter on /map...");
  await page.goto('http://localhost:5173/map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const screenshotC = path.join(outputDir, 'c_class_filter_4_classes.png');
  await page.screenshot({ path: screenshotC, fullPage: false });
  console.log(`Saved screenshot (c) -> ${screenshotC}`);

  await browser.close();
  console.log("✓ All QA screenshots captured successfully!");
})();
