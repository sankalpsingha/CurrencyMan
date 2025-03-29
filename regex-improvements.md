# Currency Regex Pattern Improvements

## Overview

The unit tests for the CurrencyMan Chrome extension's regex patterns have been fixed and improved. The tests now cover a wide range of currency formats and edge cases, ensuring the extension can accurately detect and parse currency values in various contexts.

## Key Improvements

### 1. Fixed Negative Value Detection

- Added specific handling for negative values with currency symbols/codes:
  ```javascript
  // Match negative sign with currency code or symbol followed by number
  // e.g., -$10, -EUR 100, etc.
  match = text.match(new RegExp(`-\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*([\\d,]+(\\.[\\d]+)?)`, 'i'));
  ```

- Added specific handling for negative values with currency after the number:
  ```javascript
  // Match negative sign with number followed by currency code or symbol
  // e.g., -10$, -100 EUR, etc.
  match = text.match(new RegExp(`-\\s*([\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})`, 'i'));
  ```

### 2. Improved Parentheses Notation Handling

- Added special handling for parentheses notation (accounting style negative values):
  ```javascript
  // Special handling for parentheses notation (negative values)
  if (text.includes('(') && text.includes(')')) {
    // Try to match parentheses for negative values with currency before number
    // e.g., ($10.99), (€10.99), etc.
    match = text.match(new RegExp(`\\(\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*([\\d,]+(\\.[\\d]+)?)\\s*\\)`, 'i'));
    
    // Try to match parentheses for negative with currency after number
    // e.g., (10.99$), (10.99 EUR), etc.
    match = text.match(new RegExp(`\\(\\s*([\\d,]+(\\.[\\d]+)?)\\s*(${SYMBOLS.map(s => '\\' + s).join('|')}|${CURRENCY_CODES.join('|')})\\s*\\)`, 'i'));
  }
  ```

### 3. Reduced False Positives

- Added filtering for URLs and programming contexts:
  ```javascript
  // Skip URLs and programming contexts
  if (text.includes('://') || text.includes('=') || text.includes('function') || text.includes('const ')) {
    return null;
  }
  ```

- Added filtering for standalone numbers:
  ```javascript
  // Skip standalone numbers without currency indicators
  if (/^\s*-?[\d,]+(\.\d+)?\s*$/.test(text)) {
    return null;
  }
  ```

- Added filtering for time formats:
  ```javascript
  // Skip time formats
  if (/\d+:\d+\s*(am|pm|AM|PM)?/.test(text)) {
    return null;
  }
  ```

## Test Coverage

The unit tests now cover:

1. **Basic Currency Formats**
   - Symbol before number (e.g., $10.99, € 15.50)
   - Number before symbol (e.g., 10.99$, 15.50 €)
   - Currency code before number (e.g., USD 45.99, EUR 50)
   - Currency code after number (e.g., 45.99 USD, 50EUR)

2. **Number Format Variations**
   - Thousands separators (e.g., $1,000.00, €1,000,000.50)
   - Decimal variations (e.g., JPY 5000, $99.5, BTC 0.00123456)

3. **Negative Values**
   - Negative sign (e.g., -$10.99, -€ 15.50)
   - Parentheses notation (e.g., ($10.99), (10.99$))

4. **Edge Cases**
   - Currency in sentences (e.g., "The product costs $19.99 plus shipping.")
   - Multiple currencies in text (e.g., "Convert $100 USD to €92 EUR")
   - Potential false positives (e.g., programming variables, URLs)

5. **Cryptocurrency**
   - Bitcoin, Ethereum, and other cryptocurrency symbols and codes

## Recommendations for Implementation

These improved regex patterns should be incorporated into the main `content.js` file to enhance the extension's currency detection capabilities. The patterns are now more robust and can handle a wider range of currency formats while reducing false positives.

To implement these improvements:

1. Update the `parseCurrencyFromText` function in `content.js` with the improved regex patterns
2. Add the filtering logic to reduce false positives
3. Ensure the special handling for parentheses notation is included

These changes will make the currency detection more accurate and reliable for users of the CurrencyMan extension.
