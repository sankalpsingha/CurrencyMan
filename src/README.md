# CurrencyMan Source Code

This directory contains the source code for the CurrencyMan Chrome extension.

## Directory Structure

The source code is organized into the following directories:

### 1. Background (`/background`)

Contains the background script that runs in the background of the extension:

- **background.js**: Handles API requests, caching, and background tasks

### 2. Content (`/content`)

Contains the content script that runs in the context of web pages:

- **content.js**: Detects and highlights currencies, shows conversion popups

### 3. Popup (`/popup`)

Contains the popup UI that appears when clicking the extension icon:

- **popup.html**: HTML structure for the popup
- **popup.js**: JavaScript for the popup functionality

### 4. Styles (`/styles`)

Contains the CSS styles for the extension:

- **styles.css**: Defines the appearance of currency highlights and tooltips

## Development

When making changes to the source code:

1. Modify the files in their respective directories
2. Run `npm run build` to build the extension
3. Load the `dist` directory in Chrome to test the changes

For more detailed development instructions, see the `docs/dev.md` file.
