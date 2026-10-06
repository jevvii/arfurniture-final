import { chromium, devices } from 'playwright';

async function testPlatform(platformName, deviceConfig) {
  console.log(`\n========================================`);
  console.log(`Testing ${platformName}...`);
  console.log(`========================================`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...deviceConfig });
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('tailwindcss')) {
      console.log(`[${platformName} LOG]`, text);
    }
  });

  page.on('pageerror', err => {
    console.error(`[${platformName} ERROR]`, err.message);
  });

  console.log(`Navigating to Product Detail...`);
  await page.goto('https://arfurniture-final.vercel.app/#/products/nordic-style-solid-wood-dining-desk-table', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  // Wait for model-viewer in DOM
  await page.waitForSelector('model-viewer', { timeout: 15000 });
  console.log('model-viewer found on ProductDetail!');

  // Wait for model to load or report status
  const modelStatus = await page.evaluate(async () => {
    const mv = document.querySelector('model-viewer');
    if (!mv) return { found: false };

    // Wait up to 25s for loaded or error
    if (!mv.loaded) {
      await new Promise(resolve => {
        const onLoad = () => resolve('loaded');
        const onError = (e) => resolve('error: ' + JSON.stringify(e));
        mv.addEventListener('load', onLoad, { once: true });
        mv.addEventListener('error', onError, { once: true });
        setTimeout(() => resolve('timeout'), 25000);
      });
    }

    return {
      found: true,
      src: mv.getAttribute('src'),
      iosSrc: mv.getAttribute('ios-src'),
      loaded: mv.loaded,
      canActivateAR: mv.canActivateAR,
      modelLoaded: !!mv.model
    };
  });
  console.log(`[${platformName} ProductDetail Status]:`, JSON.stringify(modelStatus, null, 2));

  // Navigate to AR View
  console.log(`Navigating to AR View...`);
  await page.goto('https://arfurniture-final.vercel.app/#/ar/nordic-style-solid-wood-dining-desk-table', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  await page.waitForSelector('model-viewer', { timeout: 15000 });
  console.log('model-viewer found on ARView!');

  const arStatus = await page.evaluate(async () => {
    const mv = document.querySelector('model-viewer');
    const intentAnchor = document.querySelector('a[href^="intent://"]');

    if (!mv.loaded) {
      await new Promise(resolve => {
        const onLoad = () => resolve('loaded');
        const onError = (e) => resolve('error: ' + JSON.stringify(e));
        mv.addEventListener('load', onLoad, { once: true });
        mv.addEventListener('error', onError, { once: true });
        setTimeout(() => resolve('timeout'), 25000);
      });
    }

    return {
      src: mv?.getAttribute('src'),
      iosSrc: mv?.getAttribute('ios-src'),
      loaded: mv?.loaded,
      canActivateAR: mv?.canActivateAR,
      intentHref: intentAnchor ? intentAnchor.getAttribute('href') : null
    };
  });
  console.log(`[${platformName} ARView Status]:`, JSON.stringify(arStatus, null, 2));

  await browser.close();
}

async function run() {
  await testPlatform('Android Pixel 7', devices['Pixel 7']);
  await testPlatform('iPhone 14 Pro Max', devices['iPhone 14 Pro Max']);
}

run().catch(console.error);
