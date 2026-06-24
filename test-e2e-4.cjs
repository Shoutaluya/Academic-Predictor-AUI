const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
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
  
  const text = await page.innerText('#result-classification');
  console.log("Result Classification Text:", text);
  
  await browser.close();
})();
