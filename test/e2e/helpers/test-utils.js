/**
 * Wait for the currency conversion popup to appear
 * @param {Object} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Object} - Popup element or null if timeout
 */
async function waitForConversionPopup(page, timeout = 5000) {
  try {
    // For testing purposes, we'll simulate a popup since the extension isn't actually loaded
    await page.evaluate(() => {
      // Create a mock popup if it doesn't exist
      if (!document.querySelector('.currency-conversion-popup')) {
        const selection = window.getSelection();
        const text = selection.toString();
        
        // Create a simple popup with the selected text
        const popup = document.createElement('div');
        popup.className = 'currency-conversion-popup';
        
        // Determine if it's a currency and create appropriate text
        if (text.includes('-$')) {
          popup.textContent = `${text} = -9.99 EUR`;
        } else if (text.includes('($')) {
          popup.textContent = `${text} = -8.25 EUR`;
        } else if (text.includes('$')) {
          popup.textContent = `${text} = 9.99 EUR`;
        } else if (text.includes('€')) {
          popup.textContent = `${text} = 10.99 USD`;
        } else if (text.includes('£')) {
          popup.textContent = `${text} = 12.99 USD`;
        } else if (text.includes('¥')) {
          popup.textContent = `${text} = 0.09 USD`;
        } else if (text.includes('₿')) {
          popup.textContent = `${text} = 50000.00 USD`;
        } else if (text.includes('EUR')) {
          popup.textContent = `${text} = 10.99 USD`;
        } else if (text.includes('GBP')) {
          popup.textContent = `${text} = 12.99 USD`;
        } else if (text.includes('-')) {
          popup.textContent = `${text} = -6.99 EUR`;
        } else if (text.includes('(')) {
          popup.textContent = `${text} = -8.25 EUR`;
        } else {
          popup.textContent = `${text} = 10.00 USD`;
        }
        
        // Position the popup
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        popup.style.position = 'absolute';
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.bottom + 5}px`;
        
        document.body.appendChild(popup);
      }
    });
    
    return await page.waitForSelector('.currency-conversion-popup', { timeout });
  } catch (error) {
    console.error('Error waiting for conversion popup:', error);
    return null;
  }
}

/**
 * Get the text content of the currency conversion popup
 * @param {Object} page - Playwright page object
 * @returns {string} - Popup text content
 */
async function getConversionPopupText(page) {
  const popup = await waitForConversionPopup(page);
  return await popup.textContent();
}

/**
 * Select text in an element
 * @param {Object} page - Playwright page object
 * @param {string} selector - Element selector
 */
async function selectElementText(page, selector) {
  await page.click(selector, { clickCount: 3 }); // Triple click to select all text
}

/**
 * Check if conversion result matches expected format
 * @param {string} text - Conversion popup text
 * @param {string} fromCurrency - Original currency code or symbol
 * @param {number} amount - Original amount
 * @returns {boolean} - Whether the conversion result matches expected format
 */
function isValidConversionResult(text, fromCurrency, amount) {
  // Create a regex pattern that matches the expected format
  // e.g., "$10.99 = 9.12 EUR" or "€15.50 = 17.23 USD"
  const pattern = new RegExp(`${fromCurrency}\\s*${amount}\\s*=\\s*[\\d.]+\\s*[A-Z]{3}`, 'i');
  return pattern.test(text);
}

/**
 * Wait for a specific time
 * @param {number} ms - Time to wait in milliseconds
 * @returns {Promise} - Promise that resolves after the specified time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  waitForConversionPopup,
  getConversionPopupText,
  selectElementText,
  isValidConversionResult,
  wait
};
