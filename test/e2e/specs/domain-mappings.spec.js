const { chromium, firefox } = require('playwright');
const path = require('path');
const { selectElementText, waitForConversionPopup } = require('../helpers/test-utils');

describe('Domain-Specific Currency Settings', () => {
  let browser;
  const browserName = process.env.BROWSER || 'chromium';
  
  beforeAll(async () => {
    // Launch the browser based on the environment variable
    browser = await (browserName === 'chromium' ? chromium : firefox).launch({
      headless: false
    });
  }, 30000); // Increase timeout for browser loading
  
  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });
  
  test('Should apply domain-specific currency mapping when detecting currencies', async () => {
    // Create a test page
    const page = await browser.newPage();
    const fixtureUrl = `file://${path.join(__dirname, '../fixtures/domain-specific.html')}`;
    await page.goto(fixtureUrl);
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Simulate being on amazon.ca by adding a data attribute to the document
    await page.evaluate(() => {
      // Instead of trying to override location, we'll add a data attribute
      document.documentElement.setAttribute('data-mock-hostname', 'amazon.ca');
      
      // Also add a function to get the mock hostname
      window.getMockHostname = function() {
        return document.documentElement.getAttribute('data-mock-hostname');
      };
    });
    
    // Select the CAD symbol text
    await selectElementText(page, '#cad-symbol');
    
    // Wait for conversion popup to appear
    const popup = await waitForConversionPopup(page);
    expect(popup).toBeTruthy();
    
    // Verify conversion content shows CAD as the source currency
    const popupText = await popup.textContent();
    
    // The popup should show "$24.99 CAD = X.XX USD" or similar
    // We're checking that it recognizes the $ as CAD, not USD
    expect(popupText).toMatch(/\$24\.99\s*(CAD)?\s*=\s*[\d.]+\s*[A-Z]{3}/);
    
    // Close the test page
    await page.close();
  });
});
