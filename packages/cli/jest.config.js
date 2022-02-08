const conf = require('jest-config')

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...conf,
  moduleNameMapper: {
    '^chooksie/internals$': '<rootDir>/../chooksie/src/internals/index.ts',
  },
}
