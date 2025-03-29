// Background script for CurrencyMan extension

// Default settings
const DEFAULT_SETTINGS = {
  targetCurrency: 'USD',
  highlightColor: '#FFFF00',
  tooltipColor: '#333333',
  tooltipTextColor: '#FFFFFF'
};

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.local.get(['targetCurrency'], function(result) {
    if (!result.targetCurrency) {
      chrome.storage.local.set(DEFAULT_SETTINGS);
    }
  });
  
  console.log('CurrencyMan extension installed');
});

// Handle messages from content script
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
            if (!data[fromCurrency.toLowerCase()]) {
              throw new Error(`Currency ${fromCurrency} not found in API response`);
            }
            
            const rates = data[fromCurrency.toLowerCase()];
            const rate = rates[toCurrency.toLowerCase()];
            
            if (!rate) {
              throw new Error(`Exchange rate for ${toCurrency} not found`);
            }
            
            // Cache the rate
            cacheRate(fromCurrency, toCurrency, rate)
              .then(() => {
                sendResponse({ success: true, result: amount * rate });
              });
          })
          .catch(error => {
            console.error('Error fetching currency data:', error);
            sendResponse({ success: false, error: error.message });
          });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Get cached exchange rate
function getCachedRate(fromCurrency, toCurrency) {
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

// Prefetch common currency rates
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

// Listen for changes in target currency to prefetch rates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.targetCurrency && changes.targetCurrency.newValue) {
    prefetchCommonRates(changes.targetCurrency.newValue);
  }
});
