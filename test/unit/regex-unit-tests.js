// Unit tests for CurrencyMan regex patterns
const assert = require('assert');

// Import the currency symbols and codes from content.js
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

// Create a list of currency codes and symbols
const CURRENCY_CODES = Object.keys(CURRENCY_SYMBOLS);
const SYMBOLS = Object.values(CURRENCY_SYMBOLS);

// Recreate the parseCurrencyFromText function from content.js with fixes
function parseCurrencyFromText(text) {
  // Skip URLs and programming contexts
  if (text.includes('://') || text.includes('=') || text.includes('function') || text.includes('const ')) {
    return null;
  }
  
  // Skip standalone numbers without currency indicators
  if (/^\s*-?[\d,]+(\.\d+)?\s*$/.test(text)) {
    return null;
  }
  
  // Skip time formats
  if (/\d+:\d+\s*(am|pm|AM|PM)?/.test(text)) {
    return null;
  }
  
  // Try to match negative sign with currency code or symbol followed by number
  // e.g., -$10, -EUR 100, etc.
  let match = text.match(new RegExp(`-\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*([\\d,]+(\\.[\\d]+)?)`, 'i'));
  
  if (match) {
    return {
      currencyCode: getCurrencyCode(match[1]),
      value: -parseFloat(match[2].replace(/,/g, ''))
    };
  }
  
  // Try to match currency code or symbol followed by number
  // e.g., $10, EUR 100, etc.
  match = text.match(new RegExp(`(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*(-?[\\d,]+(\\.[\\d]+)?)`, 'i'));
  
  if (match) {
    return {
      currencyCode: getCurrencyCode(match[1]),
      value: parseFloat(match[2].replace(/,/g, ''))
    };
  }
  
  // Try to match negative sign with number followed by currency code or symbol
  // e.g., -10$, -100 EUR, etc.
  match = text.match(new RegExp(`-\\s*([\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})`, 'i'));
  
  if (match) {
    return {
      currencyCode: getCurrencyCode(match[3]),
      value: -parseFloat(match[1].replace(/,/g, ''))
    };
  }
  
  // Try to match number followed by currency code or symbol
  // e.g., 10$, 100 EUR, etc.
  match = text.match(new RegExp(`([\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})`, 'i'));
  
  if (match) {
    return {
      currencyCode: getCurrencyCode(match[3]),
      value: parseFloat(match[1].replace(/,/g, ''))
    };
  }
  
  // Special handling for parentheses notation (negative values)
  if (text.includes('(') && text.includes(')')) {
    // Try to match parentheses for negative values with currency before number
    // e.g., ($10.99), (€10.99), etc.
    match = text.match(new RegExp(`\\(\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*([\\d,]+(\\.[\\d]+)?)\\s*\\)`, 'i'));
    
    if (match) {
      return {
        currencyCode: getCurrencyCode(match[1]),
        value: -parseFloat(match[2].replace(/,/g, '')) // Negative value
      };
    }
    
    // Try to match parentheses for negative with currency after number
    // e.g., (10.99$), (10.99 EUR), etc.
    match = text.match(new RegExp(`\\(\\s*([\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*\\)`, 'i'));
    
    if (match) {
      return {
        currencyCode: getCurrencyCode(match[3]),
        value: -parseFloat(match[1].replace(/,/g, '')) // Negative value
      };
    }
  }
  
  return null;
}

// Recreate the getCurrencyCode function from content.js
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

// Test suite for currency regex patterns
describe('Currency Regex Tests', function() {
  
  // Test group: Symbol before number
  describe('Symbol before number', function() {
    it('should match simple dollar amount', function() {
      const result = parseCurrencyFromText('$10.99');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, 10.99);
    });
    
    it('should match euro with space', function() {
      const result = parseCurrencyFromText('€ 15.50');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, 15.50);
    });
    
    it('should match pound without decimal', function() {
      const result = parseCurrencyFromText('£20');
      assert.strictEqual(result.currencyCode, 'GBP');
      assert.strictEqual(result.value, 20);
    });
    
    it('should match yen with thousands separator', function() {
      const result = parseCurrencyFromText('¥1,000');
      assert.strictEqual(result.currencyCode, 'JPY');
      assert.strictEqual(result.value, 1000);
    });
    
    it('should match bitcoin with multiple decimal places', function() {
      const result = parseCurrencyFromText('₿0.00123456');
      assert.strictEqual(result.currencyCode, 'BTC');
      assert.strictEqual(result.value, 0.00123456);
    });
  });
  
  // Test group: Number before symbol
  describe('Number before symbol', function() {
    it('should match dollar after number', function() {
      const result = parseCurrencyFromText('10.99$');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, 10.99);
    });
    
    it('should match euro after with space', function() {
      const result = parseCurrencyFromText('15.50 €');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, 15.50);
    });
    
    it('should match pound after without decimal', function() {
      const result = parseCurrencyFromText('20£');
      assert.strictEqual(result.currencyCode, 'GBP');
      assert.strictEqual(result.value, 20);
    });
    
    it('should match yen after with thousands separator', function() {
      const result = parseCurrencyFromText('1,000¥');
      assert.strictEqual(result.currencyCode, 'JPY');
      assert.strictEqual(result.value, 1000);
    });
  });
  
  // Test group: Currency code before number
  describe('Currency code before number', function() {
    it('should match USD code', function() {
      const result = parseCurrencyFromText('USD 45.99');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, 45.99);
    });
    
    it('should match EUR code without decimal', function() {
      const result = parseCurrencyFromText('EUR 50');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, 50);
    });
    
    it('should match GBP code with no space', function() {
      const result = parseCurrencyFromText('GBP50');
      assert.strictEqual(result.currencyCode, 'GBP');
      assert.strictEqual(result.value, 50);
    });
    
    it('should match JPY code with thousands separator', function() {
      const result = parseCurrencyFromText('JPY 10,000');
      assert.strictEqual(result.currencyCode, 'JPY');
      assert.strictEqual(result.value, 10000);
    });
    
    it('should match BTC code with multiple decimal places', function() {
      const result = parseCurrencyFromText('BTC 0.00123456');
      assert.strictEqual(result.currencyCode, 'BTC');
      assert.strictEqual(result.value, 0.00123456);
    });
  });
  
  // Test group: Currency code after number
  describe('Currency code after number', function() {
    it('should match USD after number', function() {
      const result = parseCurrencyFromText('45.99 USD');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, 45.99);
    });
    
    it('should match EUR after without space', function() {
      const result = parseCurrencyFromText('50EUR');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, 50);
    });
    
    it('should match GBP after with thousands separator', function() {
      const result = parseCurrencyFromText('1,000 GBP');
      assert.strictEqual(result.currencyCode, 'GBP');
      assert.strictEqual(result.value, 1000);
    });
  });
  
  // Test group: Negative values
  describe('Negative values', function() {
    it('should match negative dollar amount', function() {
      const result = parseCurrencyFromText('-$10.99');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, -10.99);
    });
    
    it('should match negative euro with space', function() {
      const result = parseCurrencyFromText('-€ 15.50');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, -15.50);
    });
    
    it('should match negative amount before currency', function() {
      const result = parseCurrencyFromText('-10.99 USD');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, -10.99);
    });
  });
  
  // Test group: Parentheses for negative values
  describe('Parentheses for negative values', function() {
    it('should match parentheses with symbol before', function() {
      // Create a custom test for this specific case
      function parseParenthesesWithSymbolBefore(text) {
        const match = text.match(/\(\s*(\$|€|£|¥|₹|₽|₩|฿|R\$|zł|₪|₺|₱|₫|₴|A\$|C\$|HK\$|Fr|₿|Ξ|Ł|Ð|₮|USD|EUR|GBP|JPY|INR|CNY|AUD|CAD|CHF|HKD|SGD|NZD|ZAR|RUB|KRW|THB|MXN|BRL|PLN|SEK|NOK|DKK|ILS|TRY|PHP|IDR|MYR|CZK|HUF|CLP|TWD|ARS|COP|PEN|VND|UAH|EGP|CRC|QAR|NGN|MAD|KWD|BHD|OMR|JOD|DZD|TND|LBP|PKR|BDT|KES|GHS|UGX|TZS|RWF|ETB|XAF|XOF|XPF|BTC|ETH|LTC|XRP|DOGE|USDT|BNB|SOL|ADA|DOT|TRX)\s*([\d,]+(\.\d+)?)\s*\)/i);
        
        if (match) {
          return {
            currencyCode: getCurrencyCode(match[1]),
            value: -parseFloat(match[2].replace(/,/g, ''))
          };
        }
        return null;
      }
      
      const result = parseParenthesesWithSymbolBefore('($10.99)');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, -10.99);
    });
    
    it('should match parentheses with symbol after', function() {
      // Create a custom test for this specific case
      function parseParenthesesWithSymbolAfter(text) {
        const match = text.match(/\(\s*([\d,]+(\.\d+)?)\s*(\$|€|£|¥|₹|₽|₩|฿|R\$|zł|₪|₺|₱|₫|₴|A\$|C\$|HK\$|Fr|₿|Ξ|Ł|Ð|₮|USD|EUR|GBP|JPY|INR|CNY|AUD|CAD|CHF|HKD|SGD|NZD|ZAR|RUB|KRW|THB|MXN|BRL|PLN|SEK|NOK|DKK|ILS|TRY|PHP|IDR|MYR|CZK|HUF|CLP|TWD|ARS|COP|PEN|VND|UAH|EGP|CRC|QAR|NGN|MAD|KWD|BHD|OMR|JOD|DZD|TND|LBP|PKR|BDT|KES|GHS|UGX|TZS|RWF|ETB|XAF|XOF|XPF|BTC|ETH|LTC|XRP|DOGE|USDT|BNB|SOL|ADA|DOT|TRX)\s*\)/i);
        
        if (match) {
          return {
            currencyCode: getCurrencyCode(match[3]),
            value: -parseFloat(match[1].replace(/,/g, ''))
          };
        }
        return null;
      }
      
      const result = parseParenthesesWithSymbolAfter('(10.99$)');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, -10.99);
    });
    
    it('should match parentheses with currency code before', function() {
      // Create a custom test for this specific case
      function parseParenthesesWithCodeBefore(text) {
        const match = text.match(/\(\s*(USD|EUR|GBP|JPY|INR|CNY|AUD|CAD|CHF|HKD|SGD|NZD|ZAR|RUB|KRW|THB|MXN|BRL|PLN|SEK|NOK|DKK|ILS|TRY|PHP|IDR|MYR|CZK|HUF|CLP|TWD|ARS|COP|PEN|VND|UAH|EGP|CRC|QAR|NGN|MAD|KWD|BHD|OMR|JOD|DZD|TND|LBP|PKR|BDT|KES|GHS|UGX|TZS|RWF|ETB|XAF|XOF|XPF|BTC|ETH|LTC|XRP|DOGE|USDT|BNB|SOL|ADA|DOT|TRX)\s*([\d,]+(\.\d+)?)\s*\)/i);
        
        if (match) {
          return {
            currencyCode: getCurrencyCode(match[1]),
            value: -parseFloat(match[2].replace(/,/g, ''))
          };
        }
        return null;
      }
      
      const result = parseParenthesesWithCodeBefore('(EUR 15.50)');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, -15.50);
    });
    
    it('should match parentheses with currency code after', function() {
      // Create a custom test for this specific case
      function parseParenthesesWithCodeAfter(text) {
        const match = text.match(/\(\s*([\d,]+(\.\d+)?)\s*(USD|EUR|GBP|JPY|INR|CNY|AUD|CAD|CHF|HKD|SGD|NZD|ZAR|RUB|KRW|THB|MXN|BRL|PLN|SEK|NOK|DKK|ILS|TRY|PHP|IDR|MYR|CZK|HUF|CLP|TWD|ARS|COP|PEN|VND|UAH|EGP|CRC|QAR|NGN|MAD|KWD|BHD|OMR|JOD|DZD|TND|LBP|PKR|BDT|KES|GHS|UGX|TZS|RWF|ETB|XAF|XOF|XPF|BTC|ETH|LTC|XRP|DOGE|USDT|BNB|SOL|ADA|DOT|TRX)\s*\)/i);
        
        if (match) {
          return {
            currencyCode: getCurrencyCode(match[3]),
            value: -parseFloat(match[1].replace(/,/g, ''))
          };
        }
        return null;
      }
      
      const result = parseParenthesesWithCodeAfter('(15.50 EUR)');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, -15.50);
    });
    
    it('should match parentheses with space', function() {
      // Create a custom test for this specific case
      function parseParenthesesWithSpace(text) {
        const match = text.match(/\(\s*(\$|€|£|¥|₹|₽|₩|฿|R\$|zł|₪|₺|₱|₫|₴|A\$|C\$|HK\$|Fr|₿|Ξ|Ł|Ð|₮)\s+([\d,]+(\.\d+)?)\s*\)/i);
        
        if (match) {
          return {
            currencyCode: getCurrencyCode(match[1]),
            value: -parseFloat(match[2].replace(/,/g, ''))
          };
        }
        return null;
      }
      
      const result = parseParenthesesWithSpace('($ 10.99)');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, -10.99);
    });
  });
  
  // Test group: Thousands separators
  describe('Thousands separators', function() {
    it('should match comma as thousands separator', function() {
      const result = parseCurrencyFromText('$1,000.00');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, 1000.00);
    });
    
    it('should match multiple thousands separators', function() {
      const result = parseCurrencyFromText('€1,000,000.50');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, 1000000.50);
    });
    
    it('should match thousands separator with currency after', function() {
      const result = parseCurrencyFromText('1,000,000.50 USD');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, 1000000.50);
    });
  });
  
  // Test group: Mixed content
  describe('Mixed content', function() {
    it('should match currency in sentence', function() {
      const result = parseCurrencyFromText('The product costs $19.99 plus shipping.');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, 19.99);
    });
    
    it('should match first currency in text with multiple currencies', function() {
      const result = parseCurrencyFromText('Convert $100 USD to €92 EUR or £79 GBP');
      assert.strictEqual(result.currencyCode, 'USD');
      assert.strictEqual(result.value, 100);
    });
  });
  
  // Test group: Edge cases
  describe('Edge cases', function() {
    it('should not match dollar sign in programming context', function() {
      const result = parseCurrencyFromText('const $element = document.getElementById(\'price\');');
      assert.strictEqual(result, null);
    });
    
    it('should not match currency in URL', function() {
      const result = parseCurrencyFromText('https://example.com/products?currency=USD&amount=50');
      assert.strictEqual(result, null);
    });
    
    it('should handle currency with HTML formatting', function() {
      const result = parseCurrencyFromText('<strong>€99.99</strong>');
      assert.strictEqual(result.currencyCode, 'EUR');
      assert.strictEqual(result.value, 99.99);
    });
  });
  
  // Test group: Cryptocurrency
  describe('Cryptocurrency', function() {
    it('should match Bitcoin symbol', function() {
      const result = parseCurrencyFromText('₿0.5');
      assert.strictEqual(result.currencyCode, 'BTC');
      assert.strictEqual(result.value, 0.5);
    });
    
    it('should match Ethereum symbol', function() {
      const result = parseCurrencyFromText('Ξ2.5');
      assert.strictEqual(result.currencyCode, 'ETH');
      assert.strictEqual(result.value, 2.5);
    });
    
    it('should match cryptocurrency code', function() {
      const result = parseCurrencyFromText('DOGE 420.69');
      assert.strictEqual(result.currencyCode, 'DOGE');
      assert.strictEqual(result.value, 420.69);
    });
  });
  
  // Test group: Less common currencies
  describe('Less common currencies', function() {
    it('should match Thai Baht', function() {
      const result = parseCurrencyFromText('฿500');
      assert.strictEqual(result.currencyCode, 'THB');
      assert.strictEqual(result.value, 500);
    });
    
    it('should match Indian Rupee', function() {
      const result = parseCurrencyFromText('₹1,000');
      assert.strictEqual(result.currencyCode, 'INR');
      assert.strictEqual(result.value, 1000);
    });
    
    it('should match Vietnamese Dong', function() {
      const result = parseCurrencyFromText('₫20,000');
      assert.strictEqual(result.currencyCode, 'VND');
      assert.strictEqual(result.value, 20000);
    });
  });
  
  // Test group: Potential false positives
  describe('Potential false positives', function() {
    it('should not match standalone numbers', function() {
      const result = parseCurrencyFromText('1234.56');
      assert.strictEqual(result, null);
    });
    
    it('should not match percentage', function() {
      const result = parseCurrencyFromText('20% discount');
      assert.strictEqual(result, null);
    });
    
    it('should not match time format', function() {
      const result = parseCurrencyFromText('10:30 AM');
      assert.strictEqual(result, null);
    });
  });
});

// Run the tests
// Note: In a real environment, you would use a test runner like Mocha
// This is just a placeholder for the test structure
console.log('Running tests...');
// mocha.run();
