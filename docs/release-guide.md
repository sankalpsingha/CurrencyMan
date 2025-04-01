# Creating a GitHub Release for CurrencyMan

This guide explains how to create a release on GitHub and upload the CurrencyMan extension .zip file for users to download.

## Prerequisites

1. A GitHub account with push access to the CurrencyMan repository
2. The built extension .zip file (created using `npm run build`)

## Step 1: Build the Extension

First, make sure you have the latest version of the extension built:

```bash
npm run build
```

This will create a `dist` directory with the extension files and a `currencyman.zip` file in the project root.

## Step 2: Create a New Release on GitHub

1. Go to your GitHub repository page
2. Click on the "Releases" tab (or navigate to `https://github.com/yourusername/currencyman/releases`)
3. Click the "Draft a new release" button

## Step 3: Fill in Release Information

1. **Tag version**: Create a new tag following semantic versioning (e.g., `v1.0.0`, `v1.1.0`, etc.)
2. **Release title**: Give your release a descriptive title (e.g., "CurrencyMan v1.0.0 - Initial Release")
3. **Description**: Write detailed release notes including:
   - New features
   - Bug fixes
   - Known issues
   - Any special installation instructions

Example release description:

```markdown
# CurrencyMan v1.0.0

Initial release of the CurrencyMan Chrome extension.

## Features
- Convert currencies by selecting text on any webpage
- Support for 150+ currencies including cryptocurrencies
- Real-time exchange rates
- Customizable target currency

## Installation
1. Download the zip file
2. Unzip to a location on your computer
3. In Chrome, go to chrome://extensions/
4. Enable "Developer mode"
5. Click "Load unpacked" and select the unzipped directory

## Known Issues
- None at this time
```

## Step 4: Upload the Extension .zip File

1. Locate the `currencyman.zip` file in your project directory (created by the build process)
2. Drag and drop this file into the "Attach binaries" section of the GitHub release page
   - Alternatively, click the "Attach binaries" area and select the file using the file browser

## Step 5: Publish the Release

1. If you want to mark this as a pre-release (beta version), check the "This is a pre-release" box
2. When you're ready to make the release public, click the "Publish release" button

## Step 6: Verify the Release

1. After publishing, go to your repository's releases page
2. Verify that the release appears with the correct tag, title, description, and attached .zip file
3. Test downloading the .zip file to ensure it works correctly

## Updating the README

After creating the release, update the README.md file with the correct link to the releases page:

```markdown
### Manual Installation

1. Download the latest release from the [Releases](https://github.com/yourusername/currencyman/releases) page
```

Replace `yourusername` with your actual GitHub username or organization name.

## Automating Releases (Optional)

For future releases, you might want to automate this process using GitHub Actions. This would allow you to automatically create a new release and upload the .zip file whenever you push a new tag to the repository.

A basic GitHub Actions workflow for this would be placed in `.github/workflows/release.yml`.
