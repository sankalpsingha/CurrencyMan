// Get DOM elements
const targetCurrencySelect = document.getElementById('targetCurrency');
const highlightColorInput = document.getElementById('highlightColor');
const tooltipColorInput = document.getElementById('tooltipColor');
const tooltipTextColorInput = document.getElementById('tooltipTextColor');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');
const highlightColorPreview = document.getElementById('highlightColorPreview');
const tooltipColorPreview = document.getElementById('tooltipColorPreview');
const tooltipTextColorPreview = document.getElementById('tooltipTextColorPreview');

// Load saved settings
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

// Save settings
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

// Prefetch exchange rates for common currencies
function prefetchRates(baseCurrency) {
  // This will trigger the background script to prefetch rates
  chrome.runtime.sendMessage({
    action: 'prefetchRates',
    currency: baseCurrency
  });
}

// Update color previews when inputs change
function updateColorPreviews() {
  highlightColorPreview.style.backgroundColor = highlightColorInput.value;
  tooltipColorPreview.style.backgroundColor = tooltipColorInput.value;
  tooltipTextColorPreview.style.backgroundColor = tooltipTextColorInput.value;
}

// Add event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
saveButton.addEventListener('click', saveSettings);
highlightColorInput.addEventListener('input', updateColorPreviews);
tooltipColorInput.addEventListener('input', updateColorPreviews);
tooltipTextColorInput.addEventListener('input', updateColorPreviews);

// Generate CSS for the content script
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

// Update CSS when settings change
function updateCSS() {
  const css = generateCSS();
  
  chrome.storage.local.set({ customCSS: css }, function() {
    console.log('CSS updated');
  });
}

// Update CSS when color inputs change
highlightColorInput.addEventListener('change', updateCSS);
tooltipColorInput.addEventListener('change', updateCSS);
tooltipTextColorInput.addEventListener('change', updateCSS);

// Generate initial CSS on load
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  updateCSS();
});
