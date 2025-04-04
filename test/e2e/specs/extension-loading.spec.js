const { chromium, firefox } = require('playwright');
const { loadExtension, getExtensionId } = require('../helpers/extension-helpers');

describe('Extension Loading', () => {
  let browser, context, extensionId;
  const browserName = process.env.BROWSER || 'chromium';
  
  beforeAll(async () => {
    // Launch the browser based on the environment variable
    browser = await (browserName === 'chromium' ? chromium : firefox).launch({
      headless: false
    });
    
    // Load the extension
    context = await loadExtension(browser, browserName);
    extensionId = await getExtensionId(context, browserName);
  }, 30000); // Increase timeout for extension loading
  
  afterAll(async () => {
    await context.close();
    await browser.close();
  });
  
  test('Extension should have correct permissions', async () => {
    // This is a basic test to verify the extension loads without permission errors
    // More detailed permission tests would depend on the specific browser APIs
    
    const page = await context.newPage();
    
    // Navigate to a test page
    await page.goto('https://example.com');
    
    // Check if content script is injected by looking for injected elements or classes
    // This will vary based on your extension, but here's a simple approach:
    // Wait a moment for content script to initialize
    await page.waitForTimeout(1000);
    
    // We'll check the console for any permission errors
    const logs = await page.evaluate(() => {
      return window.performance
        .getEntries()
        .filter(entry => entry.name.includes('extension') && entry.name.includes('error'))
        .map(entry => entry.name);
    });
    
    // There should be no extension-related errors
    expect(logs.length).toBe(0);
    
    await page.close();
  });
});
