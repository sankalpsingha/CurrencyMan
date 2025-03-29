# CurrencyMan Chrome Extension - Technical Documentation

## Overview

CurrencyMan is a Chrome extension that automatically detects and highlights currency values on webpages and converts them to the user's preferred local currency on hover. The extension supports over 150 currencies, including major fiat currencies and cryptocurrencies.

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
  "description": "Highlights currency values on webpages and converts them to your local currency",
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

1. Scanning the webpage for currency values
2. Highlighting detected currencies
3. Showing conversion tooltips on hover
4. Handling user interactions

#### Key Implementation Details:

- **Currency Detection**: Uses a comprehensive regex pattern to match various currency formats:
  ```javascript
  const CURRENCY_REGEX = new RegExp(
    `(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*([\\d,]+(\\.[\\d]+)?)|([\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})`,
    'gi'
  );
  ```

- **DOM Traversal**: Uses a TreeWalker to efficiently scan text nodes:
  ```javascript
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip script and style elements
        if (node.parentNode.tagName === 'SCRIPT' || 
            node.parentNode.tagName === 'STYLE' ||
            node.parentNode.classList.contains('currency-highlight') ||
            node.parentNode.classList.contains('currency-tooltip')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  ```

- **Text Processing**: Processes each text node to find and highlight currency values:
  ```javascript
  function processTextNode(textNode) {
    const text = textNode.nodeValue;
    const matches = [...text.matchAll(CURRENCY_REGEX)];
    
    if (matches.length === 0) return;
    
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    for (const match of matches) {
      // Add text before the match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
      }
      
      // Create highlighted span for the currency
      const span = document.createElement('span');
      span.className = 'currency-highlight';
      span.textContent = match[0];
      
      // Extract currency code and value
      let currencyCode, value;
      
      if (match[1] && match[2]) {
        // Format: $10, EUR 100
        currencyCode = getCurrencyCode(match[1]);
        value = parseFloat(match[2].replace(/,/g, ''));
      } else if (match[4] && match[6]) {
        // Format: 10$, 100 EUR
        currencyCode = getCurrencyCode(match[6]);
        value = parseFloat(match[4].replace(/,/g, ''));
      }
      
      // Store the original currency data as attributes
      span.setAttribute('data-currency-code', currencyCode);
      span.setAttribute('data-currency-value', value);
      
      // Add hover event
      span.addEventListener('mouseover', handleCurrencyHover);
      span.addEventListener('mouseout', handleCurrencyMouseOut);
      
      fragment.appendChild(span);
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }
    
    // Replace the original text node with our processed fragment
    textNode.parentNode.replaceChild(fragment, textNode);
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

- **Event Handling**: Manages hover events to show/hide tooltips:
  ```javascript
  function handleCurrencyHover(event) {
    const span = event.target;
    const currencyCode = span.getAttribute('data-currency-code');
    const value = parseFloat(span.getAttribute('data-currency-value'));
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'currency-tooltip';
    tooltip.textContent = 'Loading...';
    
    // Position the tooltip
    const rect = span.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
    
    document.body.appendChild(tooltip);
    
    // Convert the currency
    convertCurrency(currencyCode, targetCurrency, value)
      .then(convertedValue => {
        if (tooltip.parentNode) { // Check if tooltip still exists
          tooltip.textContent = `${value} ${currencyCode} = ${convertedValue.toFixed(2)} ${targetCurrency}`;
        }
      })
      .catch(error => {
        if (tooltip.parentNode) { // Check if tooltip still exists
          tooltip.textContent = `Error: Could not convert currency`;
          console.error('Currency conversion error:', error);
        }
      });
  }
  ```

- **Storage Integration**: Listens for changes in user preferences:
  ```javascript
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.targetCurrency) {
      targetCurrency = changes.targetCurrency.newValue;
      // Re-scan the page with new settings
      removeHighlights();
      scanPage();
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
    targetCurrency: 'USD',
    highlightColor: '#FFFF00',
    tooltipColor: '#333333',
    tooltipTextColor: '#FFFFFF'
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
2. Appearance customization
3. Settings persistence

#### Key Implementation Details:

- **UI Structure**: Organizes settings into logical sections:
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
    <h2 class="section-title">Appearance</h2>
    <div class="form-group">
      <label for="highlightColor">Highlight Color:</label>
      <input type="color" id="highlightColor" value="#FFFF00" />
      <span class="color-preview" id="highlightColorPreview"></span>
    </div>
    <!-- More appearance settings -->
  </div>
  ```

- **Settings Loading**: Loads saved settings from storage:
  ```javascript
  function loadSettings() {
    chrome.storage.local.get(
      [
        'targetCurrency',
        'highlightColor',
        'tooltipColor',
        'tooltipTextColor'
      ],
      function(result) {
        // Set target currency
        if (result.targetCurrency) {
          targetCurrencySelect.value = result.targetCurrency;
        }
        
        // Set highlight color
        if (result.highlightColor) {
          highlightColorInput.value = result.highlightColor;
          highlightColorPreview.style.backgroundColor = result.highlightColor;
        } else {
          highlightColorPreview.style.backgroundColor = highlightColorInput.value;
        }
        
        // Set tooltip color
        if (result.tooltipColor) {
          tooltipColorInput.value = result.tooltipColor;
          tooltipColorPreview.style.backgroundColor = result.tooltipColor;
        } else {
          tooltipColorPreview.style.backgroundColor = tooltipColorInput.value;
        }
        
        // Set tooltip text color
        if (result.tooltipTextColor) {
          tooltipTextColorInput.value = result.tooltipTextColor;
          tooltipTextColorPreview.style.backgroundColor = result.tooltipTextColor;
        } else {
          tooltipTextColorPreview.style.backgroundColor = tooltipTextColorInput.value;
        }
      }
    );
  }
  ```

- **Settings Saving**: Persists user preferences to storage:
  ```javascript
  function saveSettings() {
    const settings = {
      targetCurrency: targetCurrencySelect.value,
      highlightColor: highlightColorInput.value,
      tooltipColor: tooltipColorInput.value,
      tooltipTextColor: tooltipTextColorInput.value
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

- **CSS Generation**: Dynamically generates CSS based on user preferences:
  ```javascript
  function generateCSS() {
    const css = `
      .currency-highlight {
        background-color: ${highlightColorInput.value};
        cursor: pointer;
        padding: 0 2px;
        border-radius: 2px;
      }
      
      .currency-tooltip {
        position: absolute;
        z-index: 9999;
        background-color: ${tooltipColorInput.value};
        color: ${tooltipTextColorInput.value};
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        pointer-events: none;
      }
    `;
    
    return css;
  }
  ```

### 5. Styles (styles.css)

The styles define the appearance of:

1. Currency highlights
2. Tooltips
3. Animations

```css
/* Default styles for currency highlights and tooltips */
.currency-highlight {
  background-color: #FFFF00;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

.currency-highlight:hover {
  background-color: #FFCC00;
}

.currency-tooltip {
  position: absolute;
  z-index: 9999;
  background-color: #333333;
  color: #FFFFFF;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  pointer-events: none;
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

2. **Currency Detection**:
   - Content script scans the webpage for text nodes
   - Regex patterns identify currency values
   - Matching text is wrapped in highlight spans

3. **User Interaction**:
   - User hovers over a highlighted currency
   - Content script creates a tooltip
   - Content script requests conversion from background script or uses cached rates
   - Tooltip displays the converted value

4. **Settings Changes**:
   - User opens popup and changes settings
   - Popup saves settings to storage
   - Storage change event triggers content script to update
   - Content script removes existing highlights and rescans with new settings

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

1. **TreeWalker**: Efficiently traverses the DOM to find text nodes
2. **Rate Caching**: Minimizes API calls by storing exchange rates for 24 hours
3. **Prefetching**: Proactively fetches common exchange rates when settings change
4. **Lazy Loading**: Only converts currencies when the user hovers over them
5. **Event Delegation**: Uses efficient event handling for hover interactions

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
4. **Permission Scope**: Uses minimal permissions (storage and activeTab)

## Testing

The extension includes several testing tools:

1. **test-page.html**: Contains various currency formats to test detection
2. **api-test.html**: Tool to test the currency API directly
3. **supported-formats.html**: Documentation of all supported currency formats

## Future Enhancements

1. **Offline Mode**: Add support for working without an internet connection
2. **Custom Formats**: Allow users to define custom currency formats
3. **Context Menu**: Add right-click options for currency conversion
4. **Batch Conversion**: Convert all currencies on a page at once
5. **Historical Rates**: Support for historical exchange rates
