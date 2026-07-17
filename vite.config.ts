import { analyzer, unstableRolldownAdapter } from 'vite-bundle-analyzer';
import { defineConfig } from 'vite-plus';

import type { UserConfig } from 'vite-plus';

export default defineConfig(({ command }) => {
  const shouldAnalyze =
    command === 'build' && process.env.VP_ANALYZER === 'true';

  const config: UserConfig = {
    staged: {
      '*.ts': ['vp run test:staged', 'vp check --fix'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./setup-jsdom-test.ts'],
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.ts'],
        exclude: ['**/*.spec.ts', 'src/@types/**/*.ts', 'src/**/index.ts'],
      },
    },
    pack: {
      dts: {
        tsgo: true,
      },
      exports: true,
      minify: true,
      unbundle: true,
      entry: 'src/index.ts',
      name: 'encrypt-storage',
      target: 'esnext',
      format: ['esm', 'cjs'],
      plugins: shouldAnalyze
        ? [
            unstableRolldownAdapter(
              analyzer({
                analyzerMode: 'server',
                analyzerPort: 54329,
                reportTitle: 'Encrypt Storage Bundle Analyzer',
              }),
            ),
          ]
        : [],
    },
    lint: {
      ignorePatterns: [
        'node_modules/**/*',
        'dist/**/*',
        'build/**/*',
        '.github/**/*',
        'docs/**/*',
        'CHANGELOG.md',
        'CODE_OF_CONDUCT.md',
        'CONTRIBUTING.md',
        'README.md',
        'SECURITY.md',
      ],
      options: {
        typeAware: true,
        typeCheck: true,
      },
      plugins: ['typescript', 'oxc'],
      rules: {
        'typescript/unbound-method': 'off',
        'typescript/no-floating-promises': 'off',
        'typescript/no-redundant-type-constituents': 'off',
      },
    },
    fmt: {
      ignorePatterns: [
        'node_modules/**/*',
        'dist/**/*',
        'build/**/*',
        '.github/**/*',
        'docs/**/*',
        'CHANGELOG.md',
        'CODE_OF_CONDUCT.md',
        'CONTRIBUTING.md',
        'README.md',
        'SECURITY.md',
      ],
      sortImports: {
        newlinesBetween: true,
        groups: [
          ['value-builtin', 'value-external'],
          'value-internal',
          ['value-parent', 'value-sibling', 'value-index'],
          'unknown',
        ],
      },
      arrowParens: 'always',
      bracketSpacing: true,
      jsxBracketSameLine: false,
      jsxSingleQuote: false,
      printWidth: 80,
      proseWrap: 'always',
      quoteProps: 'as-needed',
      requirePragma: false,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
    },
    resolve: {
      tsconfigPaths: true,
    },
  };

  return config;
});
