![CurrencyMan Banner](assets/images/banner.jpg)

# CurrencyMan Browser Extension

CurrencyMan is a browser extension for Chrome and Firefox that allows you to convert currency values on webpages to your preferred local currency. Simply select any text containing a currency value, and a popup will show the converted amount.

> **Note:** This extension is currently under review in the Chrome Web Store and Firefox Add-ons. You can install it manually following the instructions below.

## Features

![Promo Tile](assets/images/promo-tile.jpg)

- Convert currencies by selecting text on any webpage
- Supports multiple currency formats (symbols and codes)
- Uses real-time exchange rates for accurate conversions
- Customizable target currency setting
- Caches exchange rates to minimize API calls
- Works with various currency formats and notations

## Project Structure

The project is organized into the following directories:

- **src/**: Source code for the extension
  - **background/**: Background script
  - **content/**: Content script
  - **popup/**: Popup UI
  - **styles/**: CSS styles
- **assets/**: Images and icons
  - **icons/**: Extension icons
  - **images/**: Promotional images
- **docs/**: Documentation
- **test/**: Test files
  - **unit/**: Unit tests
  - **manual/**: Manual test pages
- **tools/**: Utility tools

Each directory contains a README.md file with more information.

## Installation

### From Browser Stores (Coming Soon)

The extension is currently under review in the Chrome Web Store and Firefox Add-ons. Once approved, you'll be able to install it directly from there.

### Manual Installation in Chrome

1. Download the latest release from the [Releases](https://github.com/sankalpsingha/currencyman/releases) page
2. Unzip the downloaded file to a location on your computer
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" by toggling the switch in the top right corner
5. Click "Load unpacked" and select the unzipped `dist-chrome` directory
6. The extension should now be installed and active

### Manual Installation in Firefox

1. Download the latest release from the [Releases](https://github.com/yourusername/currencyman/releases) page
2. Unzip the downloaded file to a location on your computer
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on..."
5. Navigate to the unzipped `dist-firefox` directory and select the `manifest.json` file
6. The extension will be installed temporarily (until Firefox is closed)

For permanent installation in Firefox, see [Firefox Installation Guide](docs/FIREFOX.md).

### From Source Code

1. Clone or download this repository
2. Install dependencies: `npm install`
3. Build the extension:
   - For Chrome: `npm run build:chrome`
   - For Firefox: `npm run build:firefox`
   - For both: `npm run build:multi`
4. Load the extension in your browser:
   - Chrome: Navigate to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the `dist-chrome` directory
   - Firefox: Navigate to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on...", and select the `manifest.json` file in the `dist-firefox` directory

## Development

### Building the Extension

```
# Build for Chrome
npm run build:chrome

# Build for Firefox
npm run build:firefox

# Build for both browsers
npm run build:multi
```

### Running Tests

#### Unit Tests

The project includes comprehensive unit tests for the currency detection regex patterns:

```
npm test
```

These tests verify that the extension can correctly identify and parse various currency formats, including:
- Different currency symbols and codes
- Negative values (with minus sign or parentheses)
- Thousands separators
- Various decimal formats
- Edge cases and potential false positives

#### Manual Testing

Manual test pages are included to verify the extension's functionality in a browser:

1. Build and install the extension
2. Open `test/manual/test-page.html` in Chrome
3. The page contains various currency formats to test the conversion feature
4. Select any currency value on the page to see the conversion

### Watch Mode (for development)

```
# Watch for Chrome
npm run watch:chrome

# Watch for Firefox
npm run watch:firefox

# Watch for both browsers
npm run watch:multi
```

## Usage

1. Browse any webpage with currency values
2. Select any text containing a currency value (e.g., "$10.50", "EUR 100", "10 GBP")
3. A popup will appear showing the converted value in your preferred currency
4. Click the extension icon in the toolbar to open the settings panel
5. In the settings panel, you can:
   - Change your target currency
   - Save your preferences

## API Information

This extension uses the free currency conversion API from:
`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{currency}.json`

The API provides real-time exchange rates for various currencies.

## Troubleshooting

If currency conversion is not working:

1. Make sure the extension is enabled in your browser
2. Check if you have an active internet connection for API access
3. Try selecting a different currency value
4. Make sure you're selecting text that contains a valid currency format
5. Clear the extension's cache by uninstalling and reinstalling it

For Firefox-specific troubleshooting, see [Firefox Documentation](docs/FIREFOX.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Before submitting your PR, please make sure all tests pass:

```
npm test
```

## License

This project is open source and available for personal and commercial use.
