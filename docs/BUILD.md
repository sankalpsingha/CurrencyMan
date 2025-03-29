# CurrencyMan Build Process

This document explains how to build and package the CurrencyMan Chrome extension for distribution to the Chrome Web Store.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

The project uses Webpack to automate the build process. All necessary dependencies are listed in `package.json`.

To install dependencies:

```bash
npm install
```

## Build Commands

The following npm scripts are available:

- `npm run build` - Builds the extension for production
- `npm run watch` - Builds the extension and watches for changes (development mode)
- `npm run clean` - Cleans the dist directory

## Build Process

When you run `npm run build`, the following happens:

1. The `dist` directory is cleaned
2. JavaScript files (content.js, background.js, popup.js) are minified
3. CSS files are minified
4. Static files (manifest.json, popup.html) are copied to the dist directory
5. Icon files are copied to the dist directory
6. A ZIP file (`currencyman.zip`) is created in the dist directory

## Distribution Files

After building, the `dist` directory will contain:

- Minified JavaScript files (content.js, background.js, popup.js)
- Minified CSS (styles.css)
- HTML files (popup.html)
- manifest.json
- Icon files in the icons directory
- currencyman.zip (ready for upload to the Chrome Web Store)

## Chrome Web Store Submission

To submit the extension to the Chrome Web Store:

1. Build the extension with `npm run build`
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Create a new item
4. Upload the `dist/currencyman.zip` file
5. Fill in the required information (description, screenshots, etc.)
6. Submit for review

### Addressing Permission Warnings

During submission, you may receive warnings about permissions:

#### Broad Host Permissions Warning

You might see a warning about "Broad Host Permissions" because:

1. The content script uses `"matches": ["<all_urls>"]` - This is necessary because the extension needs to work on any webpage where a user might select currency text.
2. The extension requires access to the currency API via `"host_permissions": ["https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/*"]`.

**How to address this in your submission:**

When you receive this warning, you can explain in the "Additional Information" section:

> "CurrencyMan requires content script access to all URLs because it needs to detect and convert currency values on any webpage the user visits. The host permission to cdn.jsdelivr.net is specifically for accessing the currency exchange rate API. The extension does not collect or transmit any user data beyond what's needed for currency conversion functionality."

#### Justification for Permissions

In your submission, clearly explain why each permission is needed:

- `"storage"`: To save user preferences and cache exchange rates
- `"activeTab"`: To access the current tab for currency conversion
- `"host_permissions"`: To fetch real-time exchange rates from the currency API
- Content script on all URLs: To enable currency conversion on any webpage

## Updating the Extension

When you need to update the extension:

1. Make your changes to the source files
2. Update the version number in `manifest.json`
3. Run `npm run build` to create a new package
4. Upload the new ZIP file to the Chrome Web Store Developer Dashboard as a new version

## Troubleshooting

If you encounter issues with the build process:

1. Make sure all dependencies are installed (`npm install`)
2. Check that the file paths in webpack.config.js are correct
3. Try cleaning the dist directory (`npm run clean`) and rebuilding
