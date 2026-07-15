const baseConfig = require('./jest.base.config');

module.exports = {
  ...baseConfig,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/__tests__/node.spec.ts'
  ],
  coverageDirectory: 'coverage/node',
};
