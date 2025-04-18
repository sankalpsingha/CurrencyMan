// Import browser polyfill
import browserAPI from '../utils/browser-polyfill.js';

// Get DOM elements
const targetCurrencySelect = document.getElementById('targetCurrency');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const domainInput = document.getElementById('domainInput');
const domainCurrency = document.getElementById('domainCurrency');
const addDomainButton = document.getElementById('addDomainButton');
const useCurrentDomainButton = document.getElementById('useCurrentDomainButton');
const domainMappingsList = document.getElementById('domainMappingsList');
const noMappingsRow = document.getElementById('noMappingsRow');

// Store domain mappings
let domainMappings = {};

// Load saved settings
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

// Update domain mappings UI
function updateDomainMappingsUI() {
  // Clear existing rows except the "no mappings" row
  const rows = domainMappingsList.querySelectorAll('tr:not(#noMappingsRow)');
  rows.forEach(row => row.remove());
  
  // Show/hide the "no mappings" row based on whether we have mappings
  const domains = Object.keys(domainMappings);
  if (domains.length === 0) {
    noMappingsRow.style.display = 'table-row';
    return;
  } else {
    noMappingsRow.style.display = 'none';
  }
  
  // Add a row for each domain mapping
  domains.forEach(domain => {
    const currency = domainMappings[domain];
    const row = document.createElement('tr');
    
    // Domain cell
    const domainCell = document.createElement('td');
    domainCell.textContent = domain;
    domainCell.style.padding = '8px 4px';
    domainCell.style.borderBottom = '1px solid #eee';
    row.appendChild(domainCell);
    
    // Currency cell
    const currencyCell = document.createElement('td');
    currencyCell.textContent = currency;
    currencyCell.style.padding = '8px 4px';
    currencyCell.style.borderBottom = '1px solid #eee';
    row.appendChild(currencyCell);
    
    // Delete button cell
    const actionCell = document.createElement('td');
    actionCell.style.textAlign = 'center';
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.className = 'delete-btn';
    deleteButton.title = 'Delete mapping';
    
    deleteButton.addEventListener('click', () => {
      deleteDomainMapping(domain);
    });
    
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);
    
    domainMappingsList.appendChild(row);
  });
}

// Add domain mapping
function addDomainMapping() {
  const domain = domainInput.value.trim().toLowerCase();
  const currency = domainCurrency.value;
  
  // Validate domain
  if (!domain) {
    showStatus('Please enter a domain', 'error');
    return;
  }
  
  // Add or update the mapping
  domainMappings[domain] = currency;
  
  // Update UI
  updateDomainMappingsUI();
  
  // Save changes to storage immediately
  browserAPI.storage.local.set({ domainMappings: domainMappings }).then(() => {
    // Clear input
    domainInput.value = '';
    
    // Show success message
    showStatus(`Added mapping for ${domain}`, 'success');
  });
}

// Delete domain mapping
function deleteDomainMapping(domain) {
  // Remove the mapping
  delete domainMappings[domain];
  
  // Update UI
  updateDomainMappingsUI();
  
  // Save changes to storage immediately
  browserAPI.storage.local.set({ domainMappings: domainMappings }).then(() => {
    // Show success message
    showStatus(`Removed mapping for ${domain}`, 'success');
  });
}

// Show status message
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  // Position at the top
  statusDiv.style.marginTop = '0';
  statusDiv.style.marginBottom = '15px';
  
  // Hide message after 2 seconds
  setTimeout(function() {
    statusDiv.style.display = 'none';
  }, 2000);
}

// Tab functionality
function setupTabs() {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the tab to show from the data-tab attribute
      const tabToShow = button.getAttribute('data-tab');
      
      // Remove active class from all buttons and tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to the clicked button and corresponding tab
      button.classList.add('active');
      document.getElementById(tabToShow).classList.add('active');
    });
  });
}

// Save settings
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

// Prefetch exchange rates for common currencies
function prefetchRates(baseCurrency) {
  // This will trigger the background script to prefetch rates
  browserAPI.runtime.sendMessage({
    action: 'prefetchRates',
    currency: baseCurrency
  })
  .then(response => {
    if (response && response.success) {
      console.log('Successfully prefetched rates');
    } else if (response && response.error) {
      console.error('Error prefetching rates:', response.error);
    }
  })
  .catch(error => {
    console.error('Error sending prefetchRates message:', error);
  });
}

// Get current tab's domain (works with activeTab permission)
function getCurrentDomain() {
  // The tabs.query API works with activeTab permission when called from the popup
  browserAPI.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    if (tabs && tabs.length > 0) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
      domainInput.value = domain;
      
      // Try to guess the currency based on domain TLD
      const tld = domain.split('.').pop();
      if (tld) {
        // Map common TLDs to currencies
        const tldToCurrency = {
          'ca': 'CAD',
          'uk': 'GBP',
          'au': 'AUD',
          'jp': 'JPY',
          'in': 'INR',
          'cn': 'CNY',
          'hk': 'HKD',
          'sg': 'SGD',
          'nz': 'NZD',
          'eu': 'EUR',
          'de': 'EUR',
          'fr': 'EUR',
          'it': 'EUR',
          'es': 'EUR',
          'nl': 'EUR',
          'be': 'EUR',
          'at': 'EUR',
          'ie': 'EUR',
          'fi': 'EUR',
          'pt': 'EUR',
          'gr': 'EUR',
          'ch': 'CHF',
          'br': 'BRL',
          'mx': 'MXN',
          'ru': 'RUB',
          'kr': 'KRW',
          'za': 'ZAR'
        };
        
        if (tldToCurrency[tld]) {
          domainCurrency.value = tldToCurrency[tld];
        }
      }
      
      showStatus(`Domain set to ${domain}`, 'success');
    } else {
      showStatus('Could not get current tab', 'error');
    }
  });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupTabs();
});
saveButton.addEventListener('click', saveSettings);
addDomainButton.addEventListener('click', addDomainMapping);
useCurrentDomainButton.addEventListener('click', getCurrentDomain);

// Add enter key support for domain input
domainInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addDomainMapping();
  }
});
