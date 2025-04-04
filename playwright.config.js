module.exports = {
  browsers: ['chromium', 'firefox'],
  launchOptions: {
    // Use HEADLESS environment variable to control headless mode
    // Default to true (headless) if not specified
    headless: process.env.HEADLESS !== 'false',
    // Slow down execution in non-headless mode for better visibility
    slowMo: process.env.HEADLESS === 'false' ? 100 : 0,
  },
  contextOptions: {
    viewport: { width: 1280, height: 720 },
    acceptDownloads: true,
  },
};
