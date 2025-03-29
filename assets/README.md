# CurrencyMan Assets

This directory contains assets used by the CurrencyMan Chrome extension.

## Directory Structure

The assets are organized into the following directories:

### 1. Icons (`/icons`)

Contains the icons used by the extension:

- **icon16.png**: 16x16 icon for favicon and small UI elements
- **icon48.png**: 48x48 icon for the extension toolbar
- **icon128.png**: 128x128 icon for the Chrome Web Store and extension management page
- **logo-main.png**: Main logo used for branding

### 2. Images (`/images`)

Contains promotional images and other graphics:

- **Banner CurrencyMan.jpg**: Banner image for the Chrome Web Store
- **Small promo tile.jpg**: Small promotional tile for the Chrome Web Store

## Usage

When referencing these assets in the extension:

- For icons in the manifest.json file, use the path relative to the built extension (e.g., "icons/icon16.png")
- For images in HTML files, use the path relative to the HTML file

## Adding New Assets

When adding new assets:

1. Place them in the appropriate directory
2. Use descriptive filenames
3. Optimize images for web use (compress when possible)
4. Update references in code as needed
