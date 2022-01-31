/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest', { configFile: '../../.swcrc' }],
  },
}
