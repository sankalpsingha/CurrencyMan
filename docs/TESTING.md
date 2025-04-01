# Testing CurrencyMan Extension

This document explains how to test the CurrencyMan Chrome extension during development with unminified code.

## Development Build

For testing during development, you can use the development build which:
- Generates unminified JavaScript files
- Includes source maps for easier debugging
- Outputs to a separate `dist-dev` directory to avoid conflicts with production builds

### Building for Development

To create a development build:

```bash
npm run build:dev
```

This will create a `dist-dev` directory with unminified code that you can load into Chrome for testing.

### Watch Mode for Development

For continuous development, you can use watch mode which will automatically rebuild the extension whenever you make changes to the source files:

```bash
npm run watch:dev
```

Keep this command running in your terminal while you're developing, and the extension will be rebuilt automatically when you save changes to any source file.

## Loading the Extension in Chrome

To load the development version of the extension in Chrome:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click "Load unpacked" and select the `dist-dev` directory
4. The extension should now be installed and active

## Reloading After Changes

When you make changes to the extension code:

1. If you're using watch mode (`npm run watch:dev`), the code will be automatically rebuilt
2. Go to `chrome://extensions/` in Chrome
3. Click the refresh icon on the CurrencyMan extension card
4. If you've made changes to the content script, you'll need to refresh any open tabs where you want to test the extension

## Debugging

With the development build:

1. You can use `console.log()` statements in your code for debugging
2. Chrome DevTools will show the unminified source code
3. Source maps allow you to set breakpoints and debug directly in the original source files

### Debugging the Content Script

To debug the content script:

1. Open a webpage where the extension is active
2. Right-click and select "Inspect" to open DevTools
3. Go to the "Sources" tab
4. Look for the "Content scripts" section in the file tree
5. Find and open your content script file
6. You can now set breakpoints and debug

### Debugging the Background Script

To debug the background script:

1. Go to `chrome://extensions/`
2. Find the CurrencyMan extension
3. Click on "background page" under "Inspect views"
4. This will open DevTools connected to the background script
5. You can now set breakpoints and debug

### Debugging the Popup

To debug the popup:

1. Click on the CurrencyMan icon in the Chrome toolbar to open the popup
2. Right-click inside the popup and select "Inspect"
3. This will open DevTools connected to the popup
4. You can now set breakpoints and debug

## Testing Domain-Specific Currency Settings

To test the domain-specific currency settings feature:

1. Load the extension in development mode
2. Visit a website that uses a currency symbol that could be ambiguous (e.g., amazon.ca which uses "$" for CAD)
3. Click the CurrencyMan icon to open the popup
4. In the "Domain-Specific Currency Settings" section:
   - Enter the domain (e.g., "amazon.ca") manually, or
   - Click the "Use Current" button to automatically fill in the current website's domain
   - Select the currency (e.g., "CAD") if not automatically selected
   - Click "Add Domain Mapping"
5. Refresh the page
6. Select text containing a currency value (e.g., "$10.99")
7. Verify that the conversion popup shows the correct source currency (CAD instead of USD)

### Testing the "Use Current" Button

To specifically test the "Use Current" button functionality:

1. Load the extension in development mode
2. Visit different websites with different TLDs (e.g., amazon.ca, amazon.co.uk, amazon.de)
3. For each website:
   - Click the CurrencyMan icon to open the popup
   - Click the "Use Current" button
   - Verify that the domain input is filled with the correct domain
   - Verify that the currency dropdown is set to the appropriate currency based on the TLD (e.g., CAD for .ca, GBP for .co.uk, EUR for .de)
   - Click "Add Domain Mapping" to save the mapping
4. Verify that the mappings are saved correctly by checking the domain mappings table
5. Test the currency conversion on each website to ensure it uses the correct currency

## Cleaning Up

To clean the development build directory:

```bash
npm run clean:dev
```

This will remove the `dist-dev` directory and all its contents.
