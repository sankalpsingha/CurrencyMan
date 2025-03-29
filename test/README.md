# CurrencyMan Tests

This directory contains tests for the CurrencyMan Chrome extension.

## Test Structure

The tests are organized into two main categories:

### 1. Unit Tests (`/unit`)

Unit tests focus on testing individual components of the extension in isolation. Currently, we have:

- **Regex Pattern Tests**: Tests for the currency detection regex patterns used in the extension.

To run the unit tests:

```
npm test
```

### 2. Manual Tests (`/manual`)

Manual test pages that can be opened in a browser to verify the extension's functionality:

- **api-test.html**: Tests the currency API integration
- **regex-test.html**: Interactive testing of the regex patterns
- **supported-formats.html**: Documentation of supported currency formats
- **test-page.html**: General test page with various currency formats

To use these manual tests:

1. Install the extension in Chrome
2. Open any of the HTML files in Chrome
3. Follow the instructions on the page to test the extension

## Adding New Tests

### Adding Unit Tests

To add new unit tests:

1. Add test cases to the existing test files in the `/unit` directory
2. Or create new test files for different components

### Adding Manual Tests

To add new manual test pages:

1. Create a new HTML file in the `/manual` directory
2. Include clear instructions on how to use the test page
3. Add test cases that demonstrate specific functionality
