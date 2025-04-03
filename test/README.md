# CurrencyMan Tests

This directory contains tests for the CurrencyMan browser extension.

## Test Structure

The tests are organized into three main categories:

### 1. Unit Tests (`/unit`)

Unit tests focus on testing individual components of the extension in isolation. Currently, we have:

- **Regex Pattern Tests**: Tests for the currency detection regex patterns used in the extension.

To run the unit tests:

```
npm test
```

### 2. End-to-End Tests (`/e2e`)

Automated end-to-end tests using Playwright and Jest to test the extension in both Chrome and Firefox:

- **Extension Loading Tests**: Verify the extension loads correctly in both browsers
- **Content Script Tests**: Verify currency detection and conversion works
- **Popup UI Tests**: Verify settings can be changed and saved
- **Domain-Specific Settings Tests**: Verify domain mappings work correctly
- **Cross-Browser Compatibility Tests**: Verify consistent behavior across browsers

To run the end-to-end tests:

```
# Run tests in both browsers
npm run test:e2e

# Run tests in Chrome only
npm run test:e2e:chrome

# Run tests in Firefox only
npm run test:e2e:firefox
```

Note: Before running the end-to-end tests, you need to build the extension for both browsers:

```
npm run build:multi
```

### 3. Manual Tests (`/manual`)

Manual test pages that can be opened in a browser to verify the extension's functionality:

- **api-test.html**: Tests the currency API integration
- **regex-test.html**: Interactive testing of the regex patterns
- **supported-formats.html**: Documentation of supported currency formats
- **test-page.html**: General test page with various currency formats

To use these manual tests:

1. Install the extension in Chrome or Firefox
2. Open any of the HTML files in the browser
3. Follow the instructions on the page to test the extension

## Adding New Tests

### Adding Unit Tests

To add new unit tests:

1. Add test cases to the existing test files in the `/unit` directory
2. Or create new test files for different components

### Adding End-to-End Tests

To add new end-to-end tests:

1. Create a new test specification file in the `/e2e/specs` directory
2. Add test fixtures if needed in the `/e2e/fixtures` directory
3. Add helper functions if needed in the `/e2e/helpers` directory

### Adding Manual Tests

To add new manual test pages:

1. Create a new HTML file in the `/manual` directory
2. Include clear instructions on how to use the test page
3. Add test cases that demonstrate specific functionality
