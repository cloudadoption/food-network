/**
 * Test script to verify template functionality
 */

import puppeteer from 'puppeteer';

async function testTemplate() {
  console.log('Starting template test...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Collect console logs
  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log('Browser console:', text);
  });

  // Navigate to the test page
  console.log('Navigating to http://localhost:3806/test/recipe-example');
  await page.goto('http://localhost:3806/test/recipe-example', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  // Wait a bit for delayed phase
  await new Promise((resolve) => { setTimeout(resolve, 4000); });

  // Check if body has the recipe class
  const hasRecipeClass = await page.evaluate(() => document.body.classList.contains('recipe'));
  console.log('✓ Body has recipe class:', hasRecipeClass);

  // Check if recipe CSS is loaded
  const recipeCSSLoaded = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.some((link) => link.href.includes('templates/recipe/recipe.css'));
  });
  console.log('✓ Recipe CSS loaded:', recipeCSSLoaded);

  // Check if recipe metadata div was created (eager phase)
  const hasRecipeMetadata = await page.evaluate(
    () => document.querySelector('.recipe-metadata') !== null,
  );
  console.log('✓ Recipe metadata created (eager phase):', hasRecipeMetadata);

  // Check metadata content
  const metadataContent = await page.evaluate(() => {
    const metadata = document.querySelector('.recipe-metadata');
    if (!metadata) return null;
    return {
      hasPrepTime: metadata.textContent.includes('Prep Time'),
      hasCookTime: metadata.textContent.includes('Cook Time'),
      hasServings: metadata.textContent.includes('Servings'),
    };
  });
  console.log('✓ Metadata content:', metadataContent);

  // Check if print button was added (lazy phase)
  const hasPrintButton = await page.evaluate(
    () => Array.from(document.querySelectorAll('button')).some((btn) => btn.textContent.includes('Print Recipe')),
  );
  console.log('✓ Print button added (lazy phase):', hasPrintButton);

  // Check console logs for phase completion messages
  const hasEagerLog = consoleLogs.some((log) => log.includes('Recipe template: eager phase complete'));
  const hasLazyLog = consoleLogs.some((log) => log.includes('Recipe template: lazy phase complete'));
  const hasDelayedLog = consoleLogs.some((log) => log.includes('Recipe template: delayed phase complete'));

  console.log('✓ Eager phase logged:', hasEagerLog);
  console.log('✓ Lazy phase logged:', hasLazyLog);
  console.log('✓ Delayed phase logged:', hasDelayedLog);

  // Overall result
  const allTestsPassed = hasRecipeClass
    && recipeCSSLoaded
    && hasRecipeMetadata
    && metadataContent?.hasPrepTime
    && metadataContent?.hasCookTime
    && metadataContent?.hasServings
    && hasPrintButton
    && hasEagerLog
    && hasLazyLog
    && hasDelayedLog;

  console.log('\n=================================');
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED!');
  } else {
    console.log('❌ SOME TESTS FAILED');
  }
  console.log('=================================\n');

  await browser.close();

  process.exit(allTestsPassed ? 0 : 1);
}

testTemplate().catch((error) => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
