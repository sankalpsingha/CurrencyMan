/**
 * Helper module to provide consistent browser launch options
 * based on environment variables
 */

// Get headless mode from environment variable, default to true if not specified
const isHeadless = process.env.HEADLESS !== 'false';

// Get slowMo value based on headless mode
// In non-headless mode, we slow down execution for better visibility
const slowMo = isHeadless ? 0 : 100;

/**
 * Get browser launch options based on environment variables
 * @returns {Object} Browser launch options
 */
function getBrowserLaunchOptions() {
  return {
    headless: isHeadless,
    slowMo: slowMo
  };
}

module.exports = {
  getBrowserLaunchOptions
};
