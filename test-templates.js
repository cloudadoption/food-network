/**
 * Test script to verify template functionality
 * Run with: node test-templates.js
 */

import puppeteer from 'puppeteer';

async function testTemplate(page, url, templateName, expectations) {
  console.log(`\n=== Testing ${templateName} template at ${url} ===`);
  
  try {
    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait a bit for delayed phase
    await page.waitForTimeout(4000);
    
    // Check if body has template class
    const hasTemplateClass = await page.evaluate((name) => {
      return document.body.classList.contains(name);
    }, templateName);
    
    console.log(`✓ Body has template class: ${hasTemplateClass ? 'YES' : 'NO'}`);
    
    // Get console messages
    const logs = await page.evaluate(() => {
      return window.templateLogs || [];
    });
    
    // Check expectations
    for (const expectation of expectations) {
      const result = await page.evaluate(expectation.check);
      console.log(`${result ? '✓' : '✗'} ${expectation.description}: ${result ? 'PASS' : 'FAIL'}`);
    }
    
    // Take a screenshot
    const screenshotPath = `./test-${templateName}-template.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);
    
    return true;
  } catch (error) {
    console.error(`✗ Error testing ${templateName} template:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting template tests...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  
  // Collect console logs
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('template')) {
      console.log(`  Console: ${text}`);
    }
  });
  
  // Test recipe template
  await testTemplate(
    page,
    'http://localhost:3006/drafts/recipe-test',
    'recipe',
    [
      {
        description: 'Recipe metadata is transformed',
        check: () => document.querySelector('.recipe-metadata') !== null,
      },
      {
        description: 'Ingredients list is styled',
        check: () => document.querySelector('.ingredients-list') !== null,
      },
      {
        description: 'Recipe steps are styled',
        check: () => document.querySelector('.recipe-steps') !== null,
      },
      {
        description: 'Print button is added',
        check: () => document.querySelector('.print-recipe-btn') !== null,
      },
    ]
  );
  
  // Test simple template
  await testTemplate(
    page,
    'http://localhost:3006/drafts/simple-test',
    'simple',
    [
      {
        description: 'Template loaded data attribute',
        check: () => document.body.getAttribute('data-template-loaded') === 'simple',
      },
      {
        description: 'Simple banner is added',
        check: () => {
          const banner = Array.from(document.querySelectorAll('div')).find(
            (el) => el.textContent.includes('Simple Template Active')
          );
          return banner !== undefined;
        },
      },
    ]
  );
  
  await browser.close();
  
  console.log('\n=== Tests Complete ===\n');
}

runTests().catch(console.error);

