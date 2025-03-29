// Get DOM elements
const targetCurrencySelect = document.getElementById('targetCurrency');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');

// Load saved settings
function loadSettings() {
  chrome.storage.local.get(['targetCurrency'], function(result) {
    // Set target currency
    if (result.targetCurrency) {
      targetCurrencySelect.value = result.targetCurrency;
    }
  });
}

// Save settings
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

// Prefetch exchange rates for common currencies
function prefetchRates(baseCurrency) {
  // This will trigger the background script to prefetch rates
  chrome.runtime.sendMessage({
    action: 'prefetchRates',
    currency: baseCurrency
  });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
saveButton.addEventListener('click', saveSettings);
