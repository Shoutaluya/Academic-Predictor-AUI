const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`Failed request: ${response.url()} with status ${response.status()}`);
    }
  });
  page.on('pageerror', error => errors.push(error.message));
  
  await page.goto('http://127.0.0.1:3000');
  
  // click next 3 times
  await page.click('#next-btn');
  await page.waitForTimeout(600);
  await page.click('#next-btn');
  await page.waitForTimeout(600);
  await page.click('#next-btn');
  await page.waitForTimeout(600);
  
  // click execute
  await page.click('#execute-btn');
  await page.waitForTimeout(2500); // Wait for loader
  
  console.log("Errors: ", errors);
  await browser.close();
})();
