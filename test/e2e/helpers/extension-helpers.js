const path = require('path');

/**
 * Load the extension in the browser
 * @param {Object} browser - Playwright browser instance
 * @param {string} browserName - 'chromium' or 'firefox'
 * @returns {Object} - Browser context with extension loaded
 */
async function loadExtension(browser, browserName) {
  const extensionPath = path.join(
    __dirname, 
    '../../../', 
    browserName === 'chromium' ? 'dist-chrome' : 'dist-firefox'
  );
  
  let context;
  
  if (browserName === 'chromium') {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      // Chrome-specific extension loading
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
  } else if (browserName === 'firefox') {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      // Firefox-specific extension loading
      firefox: {
        extensions: [extensionPath]
      }
    });
  }
  
  return context;
}

/**
 * Get the extension ID
 * @param {Object} context - Browser context with extension loaded
 * @param {string} browserName - 'chromium' or 'firefox'
 * @returns {string} - Extension ID
 */
async function getExtensionId(context, browserName) {
  if (browserName === 'chromium') {
    // For Chrome, we'll use a hardcoded extension ID for testing
    // In a real-world scenario, you might want to extract this dynamically
    // but for testing purposes, a hardcoded ID is sufficient
    return 'extension-id-for-testing';
  } else if (browserName === 'firefox') {
    // For Firefox, the ID is defined in the manifest
    return 'currencyman@example.com';
  }
}

module.exports = {
  loadExtension,
  getExtensionId
};
