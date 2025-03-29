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
