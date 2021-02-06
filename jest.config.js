module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts}',
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
