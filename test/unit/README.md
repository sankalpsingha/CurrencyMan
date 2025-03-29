# CurrencyMan Unit Tests

This directory contains unit tests for the CurrencyMan Chrome extension, focusing on the regex patterns used for currency detection.

## Running the Tests

To run the tests, follow these steps:

1. Navigate to the project root directory:
   ```
   cd /path/to/CurrencyMan
   ```

2. Install the dependencies (if not already installed):
   ```
   npm install
   ```

3. Run the tests:
   ```
   npm test
   ```

4. To run tests in watch mode (automatically re-run when files change):
   ```
   npm run test:watch
   ```

## Test Coverage

The tests cover the following aspects of the currency regex patterns:

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

## Adding New Tests

To add new tests, simply add new test cases to the appropriate test group in the `regex-unit-tests.js` file. Follow the existing pattern:

```javascript
it('should match [description]', function() {
  const result = parseCurrencyFromText('[test string]');
  assert.strictEqual(result.currencyCode, '[expected currency code]');
  assert.strictEqual(result.value, [expected value]);
});
```

For negative tests (where no match is expected):

```javascript
it('should not match [description]', function() {
  const result = parseCurrencyFromText('[test string]');
  assert.strictEqual(result, null);
});
