module.exports = {
  preset: 'jest-playwright-preset',
  testMatch: ['**/test/e2e/**/*.spec.[jt]s?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testTimeout: 30000,
  setupFilesAfterEnv: ['./jest.setup.js'],
};
