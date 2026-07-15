const baseConfig = require('./jest.base.config');

module.exports = {
  ...baseConfig,
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/node.spec.ts'
  ],
  setupFilesAfterEnv: ['jest-localstorage-mock'],
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage/jsdom',
};
