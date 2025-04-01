# CurrencyMan Chrome Extension - Technical Documentation

## Overview

CurrencyMan is a Chrome extension that allows users to convert currency values on webpages to their preferred local currency by selecting text. The extension supports over 150 currencies, including major fiat currencies and cryptocurrencies.

## Architecture

The extension follows a standard Chrome extension architecture with the following components:

1. **Manifest File**: Defines the extension's metadata, permissions, and component relationships
2. **Content Script**: Runs in the context of web pages to detect and highlight currencies
3. **Background Script**: Handles API requests, caching, and background tasks
4. **Popup UI**: Provides a settings interface for user customization
5. **Styles**: Defines the appearance of currency highlights and tooltips

## Component Details

### 1. Manifest (manifest.json)

```json
{
  "manifest_version": 3,
  "name": "CurrencyMan",
  "version": "1.0",
  "description": "Convert selected currency values on webpages to your local currency",
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/*"
  ],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}
```

- Uses Manifest V3 for modern Chrome extension capabilities
- Requires `storage` permission for saving user preferences and caching exchange rates
- Requires `activeTab` permission to access and modify the current webpage
- Includes host permission for the currency API
- Registers a content script that runs on all URLs
- Defines a background service worker for handling API requests and caching
- Specifies a popup UI for user settings

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
  chrome.storage.onChanged.addListener(function(changes, namespace) {
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

  chrome.runtime.onInstalled.addListener(() => {
    // Set default settings
    chrome.storage.local.get(['targetCurrency'], function(result) {
      if (!result.targetCurrency) {
        chrome.storage.local.set(DEFAULT_SETTINGS);
      }
    });
    
    console.log('CurrencyMan extension installed');
  });
  ```

- **Message Handling**: Processes messages from the content script:
  ```javascript
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    chrome.storage.local.get(['targetCurrency'], function(result) {
      // Set target currency
      if (result.targetCurrency) {
        targetCurrencySelect.value = result.targetCurrency;
      }
    });
  }
  ```

- **Settings Saving**: Persists user preferences to storage:
  ```javascript
  function saveSettings() {
    const settings = {
      targetCurrency: targetCurrencySelect.value
    };
    
    chrome.storage.local.set(settings, function() {
      // Show success message
      statusDiv.textContent = 'Settings saved!';
      statusDiv.className = 'status success';
      statusDiv.style.display = 'block';
      
      // Hide message after 2 seconds
      setTimeout(function() {
        statusDiv.style.display = 'none';
      }, 2000);
      
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

## Browser Compatibility

The extension is built using Manifest V3 and modern JavaScript features, making it compatible with:

- Chrome 88+
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

## Future Enhancements

1. **Offline Mode**: Add support for working without an internet connection
2. **Context Menu**: Add right-click options for currency conversion
3. **Keyboard Shortcut**: Add keyboard shortcut for quick conversion
4. **Historical Rates**: Support for historical exchange rates
5. **Multiple Currencies**: Convert to multiple target currencies at once
6. **Enhanced Domain Mappings**: Support for pattern matching in domain mappings (e.g., *.amazon.*)
