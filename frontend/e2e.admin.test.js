import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');
    
    console.log('Waiting for Login link...');
    await page.waitForSelector('a[href="/login"]');
    await page.click('a[href="/login"]');
    
    console.log('Logging in as Admin...');
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', 'admin@glucotwin.com');
    await page.type('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for Admin redirection...');
    // React Router SPA doesn't trigger waitForNavigation reliably, wait for h1
    await page.waitForSelector('h1');
    
    // Check if we are on the admin overview
    console.log('Checking Admin Overview...');
    await page.waitForSelector('h1');
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`Found page title: ${title}`);
    
    // Navigate to some admin routes
    console.log('Navigating to Admin Settings...');
    await page.goto('http://localhost:5173/admin/settings');
    await page.waitForSelector('h1');
    const settingsTitle = await page.$eval('h1', el => el.textContent);
    console.log(`Found page title: ${settingsTitle}`);

    console.log('Navigating to Admin Audit Log...');
    await page.goto('http://localhost:5173/admin/audit');
    await page.waitForSelector('h1');
    const auditTitle = await page.$eval('h1', el => el.textContent);
    console.log(`Found page title: ${auditTitle}`);
    
    console.log('Admin tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
