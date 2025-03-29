# CurrencyMan Chrome Extension

CurrencyMan is a Chrome extension that allows you to convert currency values on webpages to your preferred local currency. Simply select any text containing a currency value, and a popup will show the converted amount.

## Features

- Convert currencies by selecting text on any webpage
- Supports multiple currency formats (symbols and codes)
- Uses real-time exchange rates for accurate conversions
- Customizable target currency setting
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
2. Select any text containing a currency value (e.g., "$10.50", "EUR 100", "10 GBP")
3. A popup will appear showing the converted value in your preferred currency
4. Click the extension icon in the toolbar to open the settings panel
5. In the settings panel, you can:
   - Change your target currency
   - Save your preferences

## Testing

A test page is included to verify the extension's functionality:

1. Open `test-page.html` in Chrome after installing the extension
2. The page contains various currency formats to test the conversion feature
3. Select any currency value on the page to see the conversion

## API Information

This extension uses the free currency conversion API from:
`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{currency}.json`

The API provides real-time exchange rates for various currencies.

## Customization

You can customize the extension through the settings panel:

1. Click the extension icon in the Chrome toolbar
2. Select your preferred target currency
3. Click "Save Settings" to apply your changes

## Troubleshooting

If currency conversion is not working:

1. Make sure the extension is enabled in Chrome
2. Check if you have an active internet connection for API access
3. Try selecting a different currency value
4. Make sure you're selecting text that contains a valid currency format
5. Clear the extension's cache by uninstalling and reinstalling it

## License

This project is open source and available for personal and commercial use.
