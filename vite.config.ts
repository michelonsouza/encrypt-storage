/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';

import { resolve } from 'node:path';

import { nodePolyfills } from 'vite-plugin-node-polyfills';
import nodeResolve from '@rollup/plugin-node-resolve';
import tsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

import * as packageJson from './package.json';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    plugins: [
      nodePolyfills(),
      tsConfigPaths(),
      dts({
        insertTypesEntry: true,
        exclude: [resolve(__dirname, 'src/lib/**/*.spec.ts')],
      }),
    ],
    deps: {
      optimizer: {
        web: {
          include: ['vitest-canvas-mock'],
        },
      },
    },
    resolve: {
      alias: {
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        assert: 'assert',
        http: 'stream-http',
        https: 'https-browserify',
        os: 'os-browserify/browser',
        url: 'url',
        buffer: 'buffer/',
        process: 'process/browser',
        path: 'path-browserify',
      },
    },
    build: {
      emptyOutDir: false,
      manifest: false,
      sourcemap: false,
      lib: {
        formats: ['es', 'cjs'],
        name: packageJson.name,
        entry: {
          index: resolve(__dirname, 'src/lib/index.ts'),
        },
      },
      rollupOptions: {
        treeshake: true,
        external: [
          ...Object.keys(packageJson.dependencies),
          resolve(__dirname, 'src/lib/**/*.spec.ts'),
        ],
        plugins: [
          nodeResolve({
            browser: true,
            preferBuiltins: false,
          }),
        ],
      },
    },
    test: {
      globals: true,
      silent: false,
      environment: 'jsdom',
      exclude: [
        'node_modules',
        'vite.config.ts',
        'src/@types/**/*.ts',
        '*.spec.ts',
      ],
      threads: false,
      setupFiles: ['./__setups__/local-storage.js'],
      mockReset: false,
      environmentOptions: {
        jsdom: {
          resources: 'usable',
        },
      },
      coverage: {
        reporter: ['text', 'html', 'clover', 'json', 'lcov'],
        exclude: [
          'src/utils',
          'src/@types',
          'src/lib/index.ts',
          'src/**/*.spec.ts',
          'vite.config.ts',
          'job-update-license-year.mjs',
        ],
        watermarks: {
          statements: [80, 95],
          functions: [80, 95],
          branches: [80, 95],
          lines: [80, 95],
        },
      },
    },
  };
});
