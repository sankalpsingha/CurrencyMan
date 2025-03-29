// Currency regex patterns
const CURRENCY_SYMBOLS = {
  // Major currency symbols
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'INR': '₹',
  'CNY': '¥',
  'AUD': 'A$',
  'CAD': 'C$',
  'CHF': 'Fr',
  'HKD': 'HK$',
  'SGD': 'S$',
  'NZD': 'NZ$',
  'ZAR': 'R',
  'RUB': '₽',
  'KRW': '₩',
  'THB': '฿',
  'MXN': 'Mex$',
  'BRL': 'R$',
  'PLN': 'zł',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'ILS': '₪',
  'TRY': '₺',
  'SAR': '﷼',
  'AED': 'د.إ',
  'PHP': '₱',
  'CZK': 'Kč',
  'IDR': 'Rp',
  'MYR': 'RM',
  'HUF': 'Ft',
  'CLP': 'CLP$',
  'TWD': 'NT$',
  'ARS': '$',
  'COP': 'COL$',
  'PEN': 'S/',
  'VND': '₫',
  'UAH': '₴',
  'EGP': 'E£',
  'CRC': '₡',
  'QAR': 'QR',
  'NGN': '₦',
  'MAD': 'MAD',
  'KWD': 'KD',
  'BHD': 'BD',
  'OMR': 'OMR',
  'JOD': 'JD',
  'DZD': 'DA',
  'TND': 'DT',
  'LBP': 'L£',
  'PKR': '₨',
  'BDT': '৳',
  'KES': 'KSh',
  'GHS': 'GH₵',
  'UGX': 'USh',
  'TZS': 'TSh',
  'RWF': 'RF',
  'ETB': 'Br',
  'XAF': 'FCFA',
  'XOF': 'CFA',
  'XPF': 'CFPF',
  'BTC': '₿',
  'ETH': 'Ξ',
  'LTC': 'Ł',
  'XRP': 'XRP',
  'DOGE': 'Ð',
  'USDT': '₮',
  'BNB': 'BNB',
  'SOL': 'SOL',
  'ADA': 'ADA',
  'DOT': 'DOT',
  'TRX': 'TRX'
};

// Create a list of currency codes
const CURRENCY_CODES = Object.keys(CURRENCY_SYMBOLS);
const SYMBOLS = Object.values(CURRENCY_SYMBOLS);

// Store user's preferred currency
let targetCurrency = 'USD';

// Initialize the extension
function init() {
  // Get user's preferred currency from storage
  chrome.storage.local.get(['targetCurrency'], function(result) {
    if (result.targetCurrency) {
      targetCurrency = result.targetCurrency;
    }
    
    // Set up the selection handler
    document.addEventListener('mouseup', handleTextSelection);
  });

  // Listen for changes in storage
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.targetCurrency) {
      targetCurrency = changes.targetCurrency.newValue;
    }
  });
}

// Handle text selection
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

// Parse currency from text
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

// Get currency code from symbol or code
function getCurrencyCode(text) {
  text = text.trim().toUpperCase();
  
  // If it's already a currency code
  if (CURRENCY_CODES.includes(text)) {
    return text;
  }
  
  // Find the currency code for the symbol
  for (const [code, symbol] of Object.entries(CURRENCY_SYMBOLS)) {
    if (text === symbol) {
      return code;
    }
  }
  
  // Default to USD if we can't determine the currency
  return 'USD';
}

// Show conversion popup
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
  popup.style.backgroundColor = '#333333';
  popup.style.color = '#FFFFFF';
  popup.style.padding = '8px 12px';
  popup.style.borderRadius = '4px';
  popup.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  popup.style.zIndex = '9999';
  popup.style.fontSize = '14px';
  
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

// Remove all conversion popups
function removeConversionPopups() {
  const popups = document.querySelectorAll('.currency-conversion-popup');
  popups.forEach(popup => popup.remove());
}

// Convert currency using the API
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

// Get cached exchange rate
async function getCachedRate(fromCurrency, toCurrency) {
  return new Promise(resolve => {
    chrome.storage.local.get(['rates', 'ratesExpiry'], function(result) {
      const now = Date.now();
      const rates = result.rates || {};
      const expiry = result.ratesExpiry || 0;
      
      // Check if cache is expired (24 hours)
      if (now > expiry) {
        resolve(null);
        return;
      }
      
      // Check if we have the rate cached
      const fromRates = rates[fromCurrency.toLowerCase()];
      if (fromRates && fromRates[toCurrency.toLowerCase()]) {
        resolve(fromRates[toCurrency.toLowerCase()]);
      } else {
        resolve(null);
      }
    });
  });
}

// Cache exchange rate
async function cacheRate(fromCurrency, toCurrency, rate) {
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

// Initialize when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
