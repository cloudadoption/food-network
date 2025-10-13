import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Testing recipe template...');
  await page.goto('http://localhost:3006/drafts/recipe-test', { waitUntil: 'networkidle0' });
  await page.waitForTimeout(4000);
  
  const hasRecipeClass = await page.evaluate(() => document.body.classList.contains('recipe'));
  const hasMetadata = await page.evaluate(() => document.querySelector('.recipe-metadata') !== null);
  const hasIngredients = await page.evaluate(() => document.querySelector('.ingredients-list') !== null);
  const hasPrintBtn = await page.evaluate(() => document.querySelector('.print-recipe-btn') !== null);
  
  console.log('Recipe template class:', hasRecipeClass ? 'YES' : 'NO');
  console.log('Recipe metadata:', hasMetadata ? 'YES' : 'NO');
  console.log('Ingredients list:', hasIngredients ? 'YES' : 'NO');
  console.log('Print button:', hasPrintBtn ? 'YES' : 'NO');
  
  await page.screenshot({ path: 'recipe-test.png', fullPage: true });
  console.log('Screenshot saved: recipe-test.png\n');
  
  console.log('Testing simple template...');
  await page.goto('http://localhost:3006/drafts/simple-test', { waitUntil: 'networkidle0' });
  await page.waitForTimeout(4000);
  
  const hasSimpleClass = await page.evaluate(() => document.body.classList.contains('simple'));
  const hasDataAttr = await page.evaluate(() => document.body.getAttribute('data-template-loaded') === 'simple');
  const hasBanner = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div')).some(el => el.textContent.includes('Simple Template Active'));
  });
  
  console.log('Simple template class:', hasSimpleClass ? 'YES' : 'NO');
  console.log('Data attribute:', hasDataAttr ? 'YES' : 'NO');
  console.log('Banner:', hasBanner ? 'YES' : 'NO');
  
  await page.screenshot({ path: 'simple-test.png', fullPage: true });
  console.log('Screenshot saved: simple-test.png');
  
  await browser.close();
  console.log('\nTests complete!');
}

test().catch(console.error);
