const path = require('path');
const glob = require('glob')

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  roots: glob.sync('packages/*/tests'),
  transform: {
    '\\.(t|j)s$': [
      '@swc/jest',
      { configFile: './.swcrc.json' },
    ],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^chooksie/lib$': resolve('./packages/chooksie/src/lib/index.ts'),
    '^chooksie/types$': resolve('./packages/chooksie/src/types/index.ts'),
  },
};
