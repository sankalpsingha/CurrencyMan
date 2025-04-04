const { chromium, firefox } = require('playwright');
const path = require('path');
const { selectElementText, waitForConversionPopup } = require('../helpers/test-utils');
const { getBrowserLaunchOptions } = require('../helpers/browser-config');

describe('Cross-Browser Compatibility', () => {
  let browsers = [];
  
  beforeAll(async () => {
    // Launch both Chrome and Firefox with the same options
    const launchOptions = getBrowserLaunchOptions();
    const chromeBrowser = await chromium.launch(launchOptions);
    const firefoxBrowser = await firefox.launch(launchOptions);
    
    browsers.push(chromeBrowser, firefoxBrowser);
  }, 60000); // Increase timeout for loading browsers
  
  afterAll(async () => {
    // Close all browsers
    for (const browser of browsers) {
      await browser.close();
    }
  });
  
  test('Currency detection should work consistently across browsers', async () => {
    // Test in Chrome
    const chromePage = await browsers[0].newPage();
    const chromeFixtureUrl = `file://${path.join(__dirname, '../fixtures/currency-examples.html')}`;
    await chromePage.goto(chromeFixtureUrl);
    await chromePage.waitForLoadState('networkidle');
    
    // Test in Firefox
    const firefoxPage = await browsers[1].newPage();
    const firefoxFixtureUrl = `file://${path.join(__dirname, '../fixtures/currency-examples.html')}`;
    await firefoxPage.goto(firefoxFixtureUrl);
    await firefoxPage.waitForLoadState('networkidle');
    
    // Test USD detection in Chrome
    await selectElementText(chromePage, '#usd-symbol');
    const chromePopup = await waitForConversionPopup(chromePage);
    expect(chromePopup).toBeTruthy();
    const chromePopupText = await chromePopup.textContent();
    
    // Test USD detection in Firefox
    await selectElementText(firefoxPage, '#usd-symbol');
    const firefoxPopup = await waitForConversionPopup(firefoxPage);
    expect(firefoxPopup).toBeTruthy();
    const firefoxPopupText = await firefoxPopup.textContent();
    
    // Both should detect the same currency and amount
    expect(chromePopupText).toMatch(/\$10\.99/);
    expect(firefoxPopupText).toMatch(/\$10\.99/);
    
    // Both should show a conversion
    expect(chromePopupText).toMatch(/=/);
    expect(firefoxPopupText).toMatch(/=/);
    
    await chromePage.close();
    await firefoxPage.close();
  });
});
