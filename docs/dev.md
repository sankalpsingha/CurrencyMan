# CurrencyMan Browser Extension - Technical Documentation

## Overview

CurrencyMan is a browser extension for Chrome and Firefox that allows users to convert currency values on webpages to their preferred local currency by selecting text. The extension supports over 150 currencies, including major fiat currencies and cryptocurrencies.

## Architecture

The extension follows a standard browser extension architecture with the following components:

1. **Manifest Files**: Define the extension's metadata, permissions, and component relationships
2. **Content Script**: Runs in the context of web pages to detect and highlight currencies
3. **Background Script**: Handles API requests, caching, and background tasks
4. **Popup UI**: Provides a settings interface for user customization
5. **Styles**: Defines the appearance of currency highlights and tooltips
6. **Browser Polyfill**: Handles browser-specific API differences

The extension uses a unified codebase with browser-specific adaptations:

1. **Browser Detection**: Detects which browser is running the extension
2. **API Polyfill**: Provides a unified API interface that works in both Chrome and Firefox
3. **Manifest Splitting**: Uses separate manifest files for common settings and browser-specific settings

## Component Details

### 1. Manifest Files

The extension uses three manifest files:

#### Common Manifest (src/manifests/common.json)

```json
{
  "name": "CurrencyMan",
  "version": "1.0",
  "description": "Convert selected currency values on webpages to your local currency",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ]
}
```

#### Chrome Manifest (src/manifests/chrome.json)

```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js"
  },
  "externally_connectable": {
    "matches": ["https://cdn.jsdelivr.net/*"]
  }
}
```

#### Firefox Manifest (src/manifests/firefox.json)

```json
{
  "manifest_version": 3,
  "browser_specific_settings": {
    "gecko": {
      "id": "currencyman@example.com",
      "strict_min_version": "109.0"
    }
  },
  "background": {
    "scripts": ["background.js"]
  }
}
```

Key differences between Chrome and Firefox manifests:
- Chrome uses `service_worker` for background scripts, while Firefox uses `scripts` array
- Firefox requires `browser_specific_settings` with a unique addon ID and minimum version
- Chrome includes `externally_connectable` for API access

During the build process, these manifest files are merged to create browser-specific manifests.

### 2. Content Script (content.js)

The content script is responsible for:

1. Detecting text selection on the webpage
2. Parsing selected text for currency values
3. Showing conversion popups with the converted amount
4. Handling user interactions

#### Key Implementation Details:

- **Text Selection Handling**: Listens for text selection events:
  ```javascript
  function handleTextSelection() {
    // Remove any existing conversion popups
    removeConversionPopups();
    
    // Get the selected text
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
      return;
    }
    
    const selectedText = selection.toString().trim();
    
    // Try to parse the currency from the selected text
    const currencyInfo = parseCurrencyFromText(selectedText);
    
    if (currencyInfo) {
      // Show conversion popup
      showConversionPopup(currencyInfo.currencyCode, currencyInfo.value, selection);
    }
  }
  ```

- **Currency Parsing**: Parses selected text for currency values:
  ```javascript
  function parseCurrencyFromText(text) {
    // Try to match currency code or symbol followed by number
    // e.g., $10, EUR 100, etc.
    let match = text.match(new RegExp(`(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*(-?[\\d,]+(\\.[\\d]+)?)`, 'i'));
    
    if (match) {
      return {
        currencyCode: getCurrencyCode(match[1]),
        value: parseFloat(match[2].replace(/,/g, ''))
      };
    }
    
    // Try to match number followed by currency code or symbol
    // e.g., 10$, 100 EUR, etc.
    match = text.match(new RegExp(`(-?[\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})`, 'i'));
    
    if (match) {
      return {
        currencyCode: getCurrencyCode(match[3]),
        value: parseFloat(match[1].replace(/,/g, ''))
      };
    }
    
    // Try to match parentheses for negative values
    // e.g., ($10.99), (€10.99), etc.
    match = text.match(new RegExp(`\\(\\s*(${SYMBOLS.map(s => '\\' + s).join('|')})\\s*([\\d,]+(\\.[\\d]+)?)\\s*\\)`, 'i'));
    
    if (match) {
      return {
        currencyCode: getCurrencyCode(match[1]),
        value: -parseFloat(match[2].replace(/,/g, '')) // Negative value
      };
    }
    
    // Try to match parentheses for negative with currency after
    // e.g., (10.99$), (10.99 EUR), etc.
    match = text.match(new RegExp(`\\(\\s*([\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*\\)`, 'i'));
    
    if (match) {
      return {
        currencyCode: getCurrencyCode(match[3]),
        value: -parseFloat(match[1].replace(/,/g, '')) // Negative value
      };
    }
    
    return null;
  }
  ```

- **Conversion Popup**: Creates and positions a popup with the converted value:
  ```javascript
  function showConversionPopup(fromCurrency, amount, selection) {
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'currency-conversion-popup';
    popup.textContent = 'Loading...';
    
    // Position the popup near the selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    popup.style.position = 'absolute';
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '2px';
    closeButton.style.right = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    closeButton.addEventListener('click', () => popup.remove());
    popup.appendChild(closeButton);
    
    document.body.appendChild(popup);
    
    // Convert the currency
    convertCurrency(fromCurrency, targetCurrency, amount)
      .then(convertedValue => {
        if (popup.parentNode) { // Check if popup still exists
          popup.textContent = `${amount} ${fromCurrency} = ${convertedValue.toFixed(2)} ${targetCurrency}`;
          popup.appendChild(closeButton); // Re-add the close button
        }
      })
      .catch(error => {
        if (popup.parentNode) { // Check if popup still exists
          popup.textContent = `Error: Could not convert currency`;
          popup.appendChild(closeButton); // Re-add the close button
          console.error('Currency conversion error:', error);
        }
      });
      
    // Close popup when clicking outside
    document.addEventListener('mousedown', function closePopupOnClickOutside(e) {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('mousedown', closePopupOnClickOutside);
      }
    });
  }
  ```

- **Currency Conversion**: Converts currencies using the API or cached rates:
  ```javascript
  async function convertCurrency(fromCurrency, toCurrency, amount) {
    // Check if we have cached rates
    const cachedRate = await getCachedRate(fromCurrency, toCurrency);
    if (cachedRate !== null) {
      return amount * cachedRate;
    }
    
    // If not cached, fetch from API
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}.json`);
      const data = await response.json();
      
      if (!data[fromCurrency.toLowerCase()]) {
        throw new Error(`Currency ${fromCurrency} not found in API response`);
      }
      
      const rates = data[fromCurrency.toLowerCase()];
      const rate = rates[toCurrency.toLowerCase()];
      
      if (!rate) {
        throw new Error(`Exchange rate for ${toCurrency} not found`);
      }
      
      // Cache the rate
      await cacheRate(fromCurrency, toCurrency, rate);
      
      return amount * rate;
    } catch (error) {
      console.error('Error fetching currency data:', error);
      throw error;
    }
  }
  ```

- **Storage Integration**: Listens for changes in user preferences:
  ```javascript
  browserAPI.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.targetCurrency) {
      targetCurrency = changes.targetCurrency.newValue;
    }
  });
  ```

### 3. Background Script (background.js)

The background script handles:

1. Extension initialization
2. API requests
3. Rate caching
4. Message handling

#### Key Implementation Details:

- **Default Settings**: Sets up default settings on installation:
  ```javascript
  const DEFAULT_SETTINGS = {
    targetCurrency: 'USD'
  };

  browserAPI.runtime.onInstalled.addListener(() => {
    // Set default settings
    browserAPI.storage.local.get(['targetCurrency', 'domainMappings']).then(result => {
      const settings = {};
      
      if (!result.targetCurrency) {
        settings.targetCurrency = DEFAULT_SETTINGS.targetCurrency;
      }
      
      if (!result.domainMappings) {
        settings.domainMappings = DEFAULT_SETTINGS.domainMappings;
      }
      
      if (Object.keys(settings).length > 0) {
        browserAPI.storage.local.set(settings);
      }
    });
    
    console.log('CurrencyMan extension installed');
  });
  ```

- **Message Handling**: Processes messages from the content script:
  ```javascript
  browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'convertCurrency') {
      const { fromCurrency, toCurrency, amount } = request;
      
      // Check if we have cached rates
      getCachedRate(fromCurrency, toCurrency)
        .then(cachedRate => {
          if (cachedRate !== null) {
            sendResponse({ success: true, result: amount * cachedRate });
            return;
          }
          
          // If not cached, fetch from API
          fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}.json`)
            .then(response => response.json())
            .then(data => {
              // Process and cache the rate
              // ...
              sendResponse({ success: true, result: amount * rate });
            })
            .catch(error => {
              sendResponse({ success: false, error: error.message });
            });
        });
      
      // Return true to indicate we'll respond asynchronously
      return true;
    }
  });
  ```

- **Rate Caching**: Implements a caching system to minimize API calls:
  ```javascript
  function cacheRate(fromCurrency, toCurrency, rate) {
    return new Promise(resolve => {
      chrome.storage.local.get(['rates'], function(result) {
        const rates = result.rates || {};
        
        // Initialize currency object if it doesn't exist
        if (!rates[fromCurrency.toLowerCase()]) {
          rates[fromCurrency.toLowerCase()] = {};
        }
        
        // Set the rate
        rates[fromCurrency.toLowerCase()][toCurrency.toLowerCase()] = rate;
        
        // Set expiry to 24 hours from now
        const expiry = Date.now() + (24 * 60 * 60 * 1000);
        
        // Save to storage
        chrome.storage.local.set({
          rates: rates,
          ratesExpiry: expiry
        }, resolve);
      });
    });
  }
  ```

- **Rate Prefetching**: Proactively fetches common exchange rates:
  ```javascript
  async function prefetchCommonRates(baseCurrency) {
    const commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR'];
    
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency.toLowerCase()}.json`);
      const data = await response.json();
      
      if (!data[baseCurrency.toLowerCase()]) {
        throw new Error(`Currency ${baseCurrency} not found in API response`);
      }
      
      const rates = data[baseCurrency.toLowerCase()];
      
      // Cache each rate
      for (const currency of commonCurrencies) {
        if (currency.toLowerCase() !== baseCurrency.toLowerCase() && rates[currency.toLowerCase()]) {
          await cacheRate(baseCurrency, currency, rates[currency.toLowerCase()]);
        }
      }
      
      console.log(`Prefetched rates for ${baseCurrency}`);
    } catch (error) {
      console.error(`Error prefetching rates for ${baseCurrency}:`, error);
    }
  }
  ```

### 4. Popup UI (popup.html, popup.js)

The popup UI provides:

1. Target currency selection
2. Usage instructions
3. Settings persistence

#### Key Implementation Details:

- **UI Structure**: Organizes settings and instructions into logical sections:
  ```html
  <div class="section">
    <h2 class="section-title">Currency Settings</h2>
    <div class="form-group">
      <label for="targetCurrency">Target Currency:</label>
      <select id="targetCurrency">
        <!-- Major Currencies -->
        <option value="USD">US Dollar (USD)</option>
        <option value="EUR">Euro (EUR)</option>
        <!-- ... over 150 currencies ... -->
      </select>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">How to Use</h2>
    <p>Select any text containing a currency value on a webpage, and a conversion popup will appear showing the value in your target currency.</p>
    <p>Examples of supported formats:</p>
    <ul>
      <li>$10.50</li>
      <li>EUR 100</li>
      <li>10 GBP</li>
      <li>¥1000</li>
    </ul>
  </div>
  ```

- **Settings Loading**: Loads saved settings from storage:
  ```javascript
  function loadSettings() {
    browserAPI.storage.local.get(['targetCurrency', 'domainMappings']).then(result => {
      // Set target currency
      if (result.targetCurrency) {
        targetCurrencySelect.value = result.targetCurrency;
      }
      
      // Load domain mappings
      if (result.domainMappings) {
        domainMappings = result.domainMappings;
        updateDomainMappingsUI();
      }
    });
  }
  ```

- **Settings Saving**: Persists user preferences to storage:
  ```javascript
  function saveSettings() {
    const settings = {
      targetCurrency: targetCurrencySelect.value,
      domainMappings: domainMappings
    };
    
    browserAPI.storage.local.set(settings).then(() => {
      // Show success message
      showStatus('Settings saved!', 'success');
      
      // Prefetch rates for the new target currency
      prefetchRates(settings.targetCurrency);
    });
  }
  ```

### 5. Styles (styles.css)

The styles define the appearance of:

1. Conversion popup
2. Animations

```css
/* Styles for currency conversion popup */
.currency-conversion-popup {
  position: absolute;
  z-index: 9999;
  background-color: #333333;
  color: #FFFFFF;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  word-wrap: break-word;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Data Flow

1. **Initialization**:
   - Background script sets default settings on installation
   - Content script loads when a webpage is opened
   - Content script retrieves user preferences from storage
   - Content script sets up text selection event listener

2. **User Interaction**:
   - User selects text containing a currency value
   - Content script parses the selected text for currency information
   - If a valid currency is found, a conversion popup is created
   - Content script converts the currency using cached rates or API
   - Popup displays the converted value

3. **Settings Changes**:
   - User opens popup and changes target currency
   - Popup saves settings to storage
   - Storage change event updates the content script's target currency

## API Integration

The extension uses the free currency conversion API from:
`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{currency}.json`

### API Response Format:

```json
{
  "date": "2025-03-29",
  "usd": {
    "eur": 0.92,
    "gbp": 0.79,
    "jpy": 150.36,
    // ... more currencies
  }
}
```

### API Usage:

1. **Request**: Fetch exchange rates for a base currency
   ```javascript
   fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}.json`)
   ```

2. **Response Processing**: Extract the needed exchange rate
   ```javascript
   const data = await response.json();
   const rates = data[fromCurrency.toLowerCase()];
   const rate = rates[toCurrency.toLowerCase()];
   ```

3. **Caching**: Store rates to minimize API calls
   ```javascript
   await cacheRate(fromCurrency, toCurrency, rate);
   ```

## Performance Optimizations

1. **Selective Processing**: Only processes text when explicitly selected by the user
2. **Rate Caching**: Minimizes API calls by storing exchange rates for 24 hours
3. **Prefetching**: Proactively fetches common exchange rates when settings change
4. **Efficient Regex**: Uses optimized regex patterns for currency detection
5. **Event Delegation**: Uses efficient event handling for selection and popup interactions

### 6. Browser Polyfill (src/utils/browser-polyfill.js)

The browser polyfill handles differences between Chrome and Firefox APIs:

```javascript
/**
 * Browser API polyfill to handle differences between Chrome and Firefox
 * 
 * This utility detects the current browser and provides a unified API
 * that works consistently across browsers.
 */

const getBrowserAPI = () => {
  // Check if we're in Firefox (browser namespace exists)
  if (typeof browser !== 'undefined') {
    return browser;
  }
  
  // We're in Chrome or another browser that uses the chrome namespace
  if (typeof chrome !== 'undefined') {
    // Create a simple polyfill for the APIs we use
    const api = { ...chrome };
    
    // Add Promise wrappers for callback-based APIs
    if (chrome.storage && chrome.storage.local) {
      const originalGet = chrome.storage.local.get;
      api.storage = api.storage || {};
      api.storage.local = api.storage.local || {};
      api.storage.local.get = (keys) => new Promise((resolve) => {
        originalGet.call(chrome.storage.local, keys, resolve);
      });
      
      const originalSet = chrome.storage.local.set;
      api.storage.local.set = (items) => new Promise((resolve) => {
        originalSet.call(chrome.storage.local, items, resolve);
      });
    }
    
    // Add more API wrappers as needed for runtime, etc.
    if (chrome.runtime) {
      const originalSendMessage = chrome.runtime.sendMessage;
      api.runtime = api.runtime || {};
      api.runtime.sendMessage = (message) => new Promise((resolve) => {
        originalSendMessage.call(chrome.runtime, message, resolve);
      });
    }
    
    return api;
  }
  
  // Fallback for environments where neither chrome nor browser is available
  console.warn('No browser API found. Using mock implementation.');
  return {
    storage: {
      local: {
        get: () => Promise.resolve({}),
        set: () => Promise.resolve()
      }
    },
    runtime: {
      sendMessage: () => Promise.resolve(),
      onMessage: { addListener: () => {} }
    }
  };
};

export default getBrowserAPI();
```

Key features of the browser polyfill:
- Detects which browser is running the extension
- Returns the native `browser` API for Firefox
- Creates a Promise-based wrapper around Chrome's callback-based APIs
- Provides a unified API interface that works in both browsers
- Includes a fallback implementation for testing environments

## Browser Compatibility

The extension is built using Manifest V3 and modern JavaScript features, making it compatible with:

- Chrome 88+
- Firefox 109+ (with Manifest V3 support)
- Edge 88+ (Chromium-based)
- Opera 74+
- Brave (latest versions)

## Security Considerations

1. **Content Security**: The extension only modifies the DOM appearance, not the underlying content
2. **API Security**: Uses HTTPS for all API requests
3. **Data Privacy**: All data is stored locally, no user data is sent to external servers
4. **Permission Scope**: Uses minimal permissions (storage and activeTab) to respect user privacy

## Testing

The extension includes several testing tools:

1. **test-page.html**: Contains various currency formats to test detection
2. **api-test.html**: Tool to test the currency API directly
3. **supported-formats.html**: Documentation of all supported currency formats

For detailed instructions on testing the extension during development with unminified code, see [TESTING.md](TESTING.md).

## Domain-Specific Currency Settings

The extension now supports domain-specific currency settings, allowing users to specify which currency should be used for specific websites. This feature addresses the issue where currency symbols like "$" are ambiguous and could represent different currencies (e.g., USD, CAD, AUD) depending on the website.

### Problem Solved

Without domain-specific settings, the extension would always interpret "$" as USD, even on websites like amazon.ca where "$" represents CAD. This led to incorrect conversions when the actual currency was different from the assumed one.

### Implementation Details

1. **Storage Structure**: Domain mappings are stored in Chrome's local storage:
   ```javascript
   {
     targetCurrency: "USD",
     domainMappings: {
       "amazon.ca": "CAD",
       "amazon.co.uk": "GBP",
       // more mappings...
     }
   }
   ```

2. **UI for Managing Mappings**: The popup UI includes a new section for managing domain mappings:
   - A table displaying existing domain-currency mappings
   - Form inputs for adding new mappings
   - "Use Current" button to automatically fill in the current website's domain
   - Delete buttons for removing mappings

3. **Domain Detection**: The content script gets the current domain and checks if there's a mapping for it:
   ```javascript
   const currentDomain = window.location.hostname;
   ```

4. **Currency Detection Override**: When a currency symbol is detected, the extension checks if there's a domain-specific mapping:
   ```javascript
   // Check if we have a domain-specific mapping for this symbol
   if (text === '$' && domainMappings[currentDomain]) {
     console.log(`Using domain-specific currency for ${currentDomain}: ${domainMappings[currentDomain]}`);
     return domainMappings[currentDomain];
   }
   ```

5. **Real-time Updates**: Changes to domain mappings are saved to storage immediately:
   - When adding a new mapping, it's saved to storage right away
   - When removing a mapping, it's deleted from storage right away
   - The content script listens for storage changes and updates its behavior accordingly

### Usage

1. **Adding a Domain Mapping**:
   - Open the extension popup
   - In the "Domain-Specific Currency Settings" section, enter a domain (e.g., "amazon.ca")
   - Select the currency to use for that domain (e.g., "CAD")
   - Click "Add Domain Mapping"

2. **Using the Current Website's Domain**:
   - Open the extension popup while on the website you want to add
   - Click the "Use Current" button next to the domain input field
   - The domain will be automatically filled in, and the extension will attempt to guess the appropriate currency based on the domain's TLD
   - Click "Add Domain Mapping" to save the mapping

3. **Removing a Domain Mapping**:
   - Open the extension popup
   - In the domain mappings table, click the delete button next to the mapping you want to remove

4. **Automatic Application**:
   - When visiting a website with a configured domain mapping, the extension will automatically use the specified currency for detection
   - No additional user action is required after setting up the mapping

## Build System

The extension uses webpack to build separate distributions for Chrome and Firefox:

1. **Manifest Merging**: During the build process, the common manifest is merged with browser-specific manifests
2. **Output Directories**: 
   - Chrome: `dist-chrome/`
   - Firefox: `dist-firefox/`
3. **Build Commands**:
   - `npm run build:chrome`: Build for Chrome only
   - `npm run build:firefox`: Build for Firefox only
   - `npm run build:multi`: Build for both browsers
4. **Watch Commands**:
   - `npm run watch:chrome`: Watch for changes and rebuild for Chrome
   - `npm run watch:firefox`: Watch for changes and rebuild for Firefox
   - `npm run watch:multi`: Watch for changes and rebuild for both browsers

## Automated Testing Framework

The extension includes a comprehensive automated testing framework using Playwright and Jest to ensure functionality across browsers.

### Testing Architecture

The automated testing framework consists of the following components:

1. **Test Runners**:
   - Jest: JavaScript testing framework for running tests
   - Playwright: Browser automation library for simulating user interactions

2. **Test Structure**:
   - **End-to-End Tests**: Test the extension's functionality in a real browser environment
   - **Cross-Browser Tests**: Verify consistent behavior across Chrome and Firefox
   - **Fixtures**: HTML files with various currency examples for testing

3. **Helper Utilities**:
   - **Extension Helpers**: Functions for loading the extension in browsers
   - **Test Utilities**: Functions for simulating user interactions and verifying results

### Key Components

#### 1. Test Fixtures

Test fixtures are HTML files containing various currency examples for testing:

- **currency-examples.html**: Contains examples of different currency formats
- **domain-specific.html**: Contains examples for testing domain-specific currency detection

#### 2. Extension Helpers

Functions for loading and interacting with the extension:

```javascript
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
```

#### 3. Test Utilities

Functions for simulating user interactions and verifying results:

```javascript
async function selectElementText(page, selector) {
  await page.click(selector, { clickCount: 3 }); // Triple click to select all text
}

async function waitForConversionPopup(page, timeout = 5000) {
  return await page.waitForSelector('.currency-conversion-popup', { timeout });
}
```

#### 4. Test Specifications

The test suite includes several test specifications:

- **Extension Loading Tests**: Verify the extension loads correctly in both browsers
- **Content Script Tests**: Verify currency detection and conversion for various formats
- **Popup UI Tests**: Verify settings can be changed and saved
- **Domain-Specific Settings Tests**: Verify domain mappings work correctly
- **Cross-Browser Compatibility Tests**: Verify consistent behavior across browsers

Example test:

```javascript
test('Should detect and convert USD symbol', async () => {
  // Select the USD text
  await selectElementText(page, '#usd-symbol');
  
  // Wait for conversion popup to appear
  const popup = await waitForConversionPopup(page);
  expect(popup).toBeTruthy();
  
  // Verify conversion content
  const popupText = await popup.textContent();
  expect(popupText).toMatch(/\$10\.99\s*=\s*[\d.]+ [A-Z]{3}/);
});
```

### Technical Challenges and Solutions

#### 1. Extension ID Challenge

**Problem**: To access an extension's popup, we need its ID, which is dynamically generated when the extension is loaded. Playwright cannot directly navigate to `chrome://extensions` to get this ID due to security restrictions.

**Solution**: For testing purposes, we use a hardcoded extension ID and focus on testing the content script functionality, which doesn't require direct access to the extension popup.

#### 2. Cross-Browser Testing

**Problem**: Chrome and Firefox have different ways of loading and interacting with extensions.

**Solution**: We implemented browser-specific code for loading extensions and abstracted away the differences in a helper module.

#### 3. Simulating User Interactions

**Problem**: Testing currency detection requires simulating text selection and verifying the popup appears.

**Solution**: We implemented helper functions to select text and wait for the conversion popup to appear.

### Running the Tests

The tests can be run using the following commands:

```bash
# Install Playwright browsers (one-time setup)
npx playwright install

# Build the extension for both browsers
npm run build:multi

# Run tests in both Chrome and Firefox
npm run test:e2e

# Run tests in Chrome only
npm run test:e2e:chrome

# Run tests in Firefox only
npm run test:e2e:firefox
```

### Future Testing Improvements

1. **Extension Popup Testing**: Implement a reliable way to test the extension popup UI directly, possibly using a specialized extension testing framework or a headless version of the popup UI.

2. **API Mocking**: Add mocks for the currency API to test offline behavior and error handling.

3. **Visual Regression Testing**: Add visual comparison tests to ensure the UI appears correctly across browsers.

4. **Performance Testing**: Add tests to measure and ensure the extension's performance meets requirements.

5. **Accessibility Testing**: Add tests to verify the extension is accessible to users with disabilities.

6. **Integration with CI/CD**: Set up continuous integration to run tests automatically on code changes.

7. **Test Coverage Reporting**: Add test coverage reporting to identify untested code.

8. **End-to-End User Flows**: Add tests for complete user flows, from installation to daily usage.

## Future Enhancements

1. **Offline Mode**: Add support for working without an internet connection
2. **Context Menu**: Add right-click options for currency conversion
3. **Keyboard Shortcut**: Add keyboard shortcut for quick conversion
4. **Historical Rates**: Support for historical exchange rates
5. **Multiple Currencies**: Convert to multiple target currencies at once
6. **Enhanced Domain Mappings**: Support for pattern matching in domain mappings (e.g., *.amazon.*)
7. **Additional Browser Support**: Add support for Safari and other browsers
8. **Improved Testing**: Implement the testing improvements outlined above
9. **Accessibility Improvements**: Ensure the extension is fully accessible
10. **Performance Optimizations**: Further optimize the extension for speed and efficiency
