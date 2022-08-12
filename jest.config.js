module.exports = {
  roots: ['<rootDir>'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/types.ts',
    '!<rootDir>/src/experiments/*.ts',
    '!**/*.d.ts',
  ],
  setupFiles: ['jest-localstorage-mock'],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  transform: {
    '.+\\.ts$': 'ts-jest',
  },
};
