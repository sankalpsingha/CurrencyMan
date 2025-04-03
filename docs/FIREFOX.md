# CurrencyMan Firefox Extension

This document explains how to build and use the Firefox version of the CurrencyMan extension.

## Overview

CurrencyMan now supports both Chrome and Firefox browsers. The codebase is unified, with browser-specific differences handled through:

1. Browser detection and API polyfill
2. Browser-specific manifest files
3. Separate build outputs for each browser

## Building the Extension

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Build Commands

The following npm scripts are available for Firefox builds:

- `npm run build:multi` - Builds the extension for both Chrome and Firefox
- `npm run build:firefox` - Builds the extension for Firefox only
- `npm run watch:firefox` - Builds the Firefox extension and watches for changes
- `npm run clean:multi` - Cleans both Chrome and Firefox dist directories

### Build Output

When you run `npm run build:firefox` or `npm run build:multi`, the Firefox extension will be built to:

- `dist-firefox/` - Contains all the extension files
- `dist-firefox/currencyman-firefox.zip` - ZIP file ready for submission to Firefox Add-ons

## Installing in Firefox

### Temporary Installation (for testing)

1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on..."
5. Navigate to the `dist-firefox` directory and select any file (e.g., `manifest.json`)
6. The extension will be installed temporarily (until Firefox is closed)

### Permanent Installation

To install the extension permanently, you need to submit it to the Firefox Add-ons store:

1. Create an account on [Firefox Add-ons Developer Hub](https://addons.mozilla.org/en-US/developers/)
2. Click "Submit a New Add-on"
3. Choose "On this site" and upload the `dist-firefox/currencyman-firefox.zip` file
4. Fill in the required information and submit for review

## Firefox-Specific Considerations

### Manifest Differences

The Firefox manifest differs from Chrome in a few key ways:

1. Includes `browser_specific_settings` with Firefox addon ID and minimum version
2. Uses `"background": { "scripts": ["background.js"] }` instead of `"service_worker"`

### API Differences

Firefox uses the `browser.*` namespace for its WebExtension APIs, while Chrome uses `chrome.*`. Additionally:

- Firefox's implementation is Promise-based
- Chrome's implementation is callback-based

CurrencyMan handles these differences through a browser polyfill that:

1. Detects which browser is running the extension
2. Provides a unified API interface that works in both browsers
3. Wraps Chrome's callback-based APIs with Promises for Firefox compatibility

## Testing

When testing the Firefox version, pay special attention to:

1. Storage operations (settings, cached exchange rates)
2. Background script functionality
3. Content script injection and operation
4. Popup UI functionality

## Troubleshooting

If you encounter issues with the Firefox version:

1. Check the Firefox browser console for errors (`about:debugging` -> "Inspect" on the extension)
2. Verify the manifest.json has the correct Firefox-specific settings
3. Ensure the browser polyfill is correctly detecting Firefox
4. Test with a clean Firefox profile to rule out conflicts with other extensions

## Firefox Add-on Policies

When submitting to the Firefox Add-ons store, be aware of their policies:

1. All code must be open source or properly licensed
2. The extension must clearly communicate its functionality to users
3. Privacy policy must be provided if any user data is collected
4. Permissions must be justified in the submission notes

For more information, see the [Firefox Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/).
