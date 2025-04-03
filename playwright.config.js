module.exports = {
  browsers: ['chromium', 'firefox'],
  launchOptions: {
    headless: false,
    slowMo: 100,
  },
  contextOptions: {
    viewport: { width: 1280, height: 720 },
    acceptDownloads: true,
  },
};
