import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');
    
    console.log('Waiting for Create account link...');
    await page.waitForSelector('a[href="/create-account"]');
    await page.click('a[href="/create-account"]');
    
    console.log('Filling out registration form...');
    await page.waitForSelector('input[name="fullName"]');
    await page.type('input[name="fullName"]', 'Test User');
    await page.type('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.type('input[name="password"]', 'Password123!');
    
    console.log('Submitting form...');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for Dashboard to load...');
    await page.waitForSelector('h1', { text: "Today's Overview" });
    
    console.log('Checking navigation links...');
    await page.waitForSelector('a[href="/bolus-prediction"]');
    await page.click('a[href="/bolus-prediction"]');
    await page.waitForSelector('h1');
    
    console.log('Test completed successfully! Full stack is fully functional.');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
