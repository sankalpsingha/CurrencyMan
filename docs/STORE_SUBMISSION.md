# Chrome Web Store Submission Guide for CurrencyMan

This guide provides detailed instructions for submitting the CurrencyMan extension to the Chrome Web Store, with special attention to addressing common review issues.

## Preparing for Submission

1. **Build the extension package**:
   ```bash
   npm run build
   ```
   This will create a `dist/currencyman.zip` file ready for submission.

2. **Test the built extension**:
   - Go to `chrome://extensions/` in Chrome
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked" and select the `dist` directory
   - Verify all functionality works correctly

## Submission Process

1. **Access the Developer Dashboard**:
   - Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Sign in with your Google account
   - Pay the one-time $5 developer registration fee if you haven't already

2. **Create a New Item**:
   - Click "New Item" in the dashboard
   - Upload the `dist/currencyman.zip` file

3. **Fill in Store Listing Information**:
   - **Store listing**:
     - Extension name: "CurrencyMan"
     - Summary: "Convert selected currency values on webpages to your local currency"
     - Detailed description: Expand on features, usage instructions, and benefits
     - Category: "Productivity" or "Tools"
     - Language: English (and any other supported languages)

   - **Graphics**:
     - Upload a 128x128 icon (already in your package)
     - Create and upload promotional images:
       - Small promotional tile (440x280px)
       - Large promotional tile (920x680px) (optional)
       - Marquee promotional tile (1400x560px) (optional)
     - Add at least 1-5 screenshots (1280x800px) showing your extension in action

   - **Additional fields**:
     - Website: Your website or GitHub repository (optional)
     - Support URL: Email or support page
     - Privacy policy: URL to privacy policy (required)

## Addressing Permission Warnings

### Broad Host Permissions Warning

You will likely receive a warning about "Broad Host Permissions" during submission. This is because:

1. The content script uses `"matches": ["<all_urls>"]`
2. The extension requires access to the currency API

### How to Address This Warning

In the "Additional Information" section of your submission, provide a clear explanation:

> **Justification for permissions**:
>
> CurrencyMan requires specific permissions to function properly:
>
> 1. **Content script on all URLs**: The extension needs to detect and convert currency values on any webpage the user visits. This is the core functionality of the extension and cannot be limited to specific sites since users may encounter currency values on any website.
>
> 2. **Host permission to cdn.jsdelivr.net**: This is specifically for accessing the currency exchange rate API to get real-time conversion rates. The extension only makes API calls when a user selects text containing a currency value.
>
> 3. **Storage permission**: Used to save user preferences (target currency) and cache exchange rates to minimize API calls.
>
> 4. **ActiveTab permission**: Used to access the current tab for currency conversion functionality.
>
> The extension does not collect, store, or transmit any user data beyond what's needed for currency conversion functionality. No personal information is collected.

## Privacy Policy Requirements

You'll need to provide a privacy policy URL. Create a simple privacy policy that includes:

1. What information your extension collects (if any)
2. How that information is used
3. Whether the information is shared with third parties
4. How users can contact you with privacy concerns

Example privacy policy statement:

> **CurrencyMan Privacy Policy**
>
> CurrencyMan is designed with privacy in mind and collects minimal data:
>
> - **User preferences**: We store your preferred target currency locally on your device using Chrome's storage API. This information never leaves your browser.
>
> - **Exchange rates**: We cache currency exchange rates temporarily (24 hours) to minimize API calls. This data is stored locally on your device.
>
> - **API usage**: When you select text containing a currency value, we make an API call to fetch current exchange rates. No personal information is sent with these requests.
>
> We do not collect, store, or transmit:
> - Browsing history
> - Personal information
> - The content of websites you visit
>
> The extension does not use cookies, analytics, or tracking technologies.
>
> For questions about privacy, contact: [your email]

## Common Rejection Reasons and How to Avoid Them

1. **Insufficient description**: Provide a detailed description of what your extension does and how to use it.

2. **Missing or inadequate privacy policy**: Ensure your privacy policy clearly explains what data is collected and how it's used.

3. **Deceptive functionality**: Make sure your extension description accurately reflects its functionality.

4. **Poor user experience**: Test thoroughly to ensure your extension works as expected.

5. **Requesting unnecessary permissions**: The permissions requested should match the functionality described.

## After Submission

- The review process typically takes 1-3 business days
- You'll receive an email when the review is complete
- If rejected, carefully read the feedback and make necessary adjustments
- Resubmit after addressing any issues

## Updating Your Extension

When you need to update your extension:

1. Make changes to your source files
2. Update the version number in `manifest.json`
3. Run `npm run build` to create a new package
4. In the Developer Dashboard, select your extension and click "Package" > "Upload new package"
5. Upload the new ZIP file and submit for review
