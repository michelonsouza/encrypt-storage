module.exports = {
  roots: ['<rootDir>'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/types.ts',
    '!<rootDir>/src/experiments/*.ts',
    '!**/*.d.ts',
    '!./prepublish.js',
    '!./postpublish.js',
  ],
  collectCoverage: true,
  coverageReporters: ['json'],
  preset: 'ts-jest',
  transformIgnorePatterns: [
    '/node_modules/(?!(?:@faker-js/faker)/)',
  ],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      sourceMap: true,
      inlineSourceMap: true,
      tsconfig: {
        allowJs: true,
        module: 'commonjs',
      },
    }],
  },
};
