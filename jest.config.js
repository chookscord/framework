const { resolve } = require('path');

module.exports = {
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
