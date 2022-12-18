/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  globalSetup: '<rootDir>/test/global.setup.ts',
  globalTeardown: '<rootDir>/test/global.teardown.ts',
  testMatch: [
    '<rootDir>/test/**/*.test.ts',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'index.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
};

export default config;
