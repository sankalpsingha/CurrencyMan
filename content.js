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

// Create a regex pattern for currency detection
const CURRENCY_CODES = Object.keys(CURRENCY_SYMBOLS);
const SYMBOLS = Object.values(CURRENCY_SYMBOLS);

// Pattern for $10, $10.50, 10 USD, 10.50 EUR, etc.
const CURRENCY_REGEX = new RegExp(
  `(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*([\\d,]+(\\.[\\d]+)?)|([\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})`,
  'gi'
);

// Store user's preferred currency
let targetCurrency = 'USD';
let conversionRates = {};

// Initialize the extension
function init() {
  // Get user's preferred currency from storage
  chrome.storage.local.get(['targetCurrency'], function(result) {
    if (result.targetCurrency) {
      targetCurrency = result.targetCurrency;
    }
    
    // Start scanning the page
    scanPage();
  });

  // Listen for changes in storage
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.targetCurrency) {
      targetCurrency = changes.targetCurrency.newValue;
      // Re-scan the page with new settings
      removeHighlights();
      scanPage();
    }
  });
}

// Scan the page for currency values
function scanPage() {
  // Walk through all text nodes in the document
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

  const textNodes = [];
  let currentNode;
  
  while (currentNode = walker.nextNode()) {
    textNodes.push(currentNode);
  }

  // Process each text node
  textNodes.forEach(processTextNode);
}

// Process a text node to find and highlight currency values
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

// Handle hovering over a currency value
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

// Handle mouse out event
function handleCurrencyMouseOut() {
  const tooltips = document.querySelectorAll('.currency-tooltip');
  tooltips.forEach(tooltip => tooltip.remove());
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

// Remove all currency highlights
function removeHighlights() {
  const highlights = document.querySelectorAll('.currency-highlight');
  
  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    const text = document.createTextNode(highlight.textContent);
    parent.replaceChild(text, highlight);
  });
  
  // Also remove any tooltips
  const tooltips = document.querySelectorAll('.currency-tooltip');
  tooltips.forEach(tooltip => tooltip.remove());
}

// Initialize when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
