# CurrencyMan Chrome Extension

CurrencyMan is a Chrome extension that automatically detects and highlights currency values on webpages. When you hover over a highlighted currency, it shows the converted value in your preferred local currency.

## Features

- Automatically detects and highlights currency values on any webpage
- Supports multiple currency formats (symbols and codes)
- Converts currencies on hover using real-time exchange rates
- Customizable settings for target currency and appearance
- Caches exchange rates to minimize API calls
- Works with various currency formats and notations

## Installation

### From Source Code

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now be installed and active

### Note About Icons

The extension currently doesn't require icons to function. The `icon-generator.html` file is provided as a tool to generate icons if you wish to add them to the extension. To add icons:

1. Open `icon-generator.html` in your browser
2. Click the "Generate All Icons" button
3. Download each icon by clicking the "Download" links
4. Save the icons to the `icons` folder in the extension directory
5. Update the manifest.json file to include the icon paths

## Usage

1. Browse any webpage with currency values
2. Currency values will be automatically highlighted
3. Hover over a highlighted currency to see the converted value in your preferred currency
4. Click the extension icon in the toolbar to open the settings panel
5. In the settings panel, you can:
   - Change your target currency
   - Customize the highlight and tooltip colors
   - Save your preferences

## Testing

A test page is included to verify the extension's functionality:

1. Open `test-page.html` in Chrome after installing the extension
2. The page contains various currency formats to test the highlighting and conversion features
3. Hover over any highlighted currency to see the conversion

## API Information

This extension uses the free currency conversion API from:
`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{currency}.json`

The API provides real-time exchange rates for various currencies.

## Customization

You can customize the extension's appearance through the settings panel:

1. Click the extension icon in the Chrome toolbar
2. Adjust the highlight color, tooltip background color, and tooltip text color
3. Click "Save Settings" to apply your changes

## Troubleshooting

If currencies are not being highlighted or converted:

1. Make sure the extension is enabled in Chrome
2. Check if you have an active internet connection for API access
3. Try refreshing the page
4. Clear the extension's cache by uninstalling and reinstalling it

## License

This project is open source and available for personal and commercial use.
