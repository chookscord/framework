module.exports = {
  transform: {
    '\\.(t|j)s$': [
      '@swc/jest',
      { configFile: './.swcrc.json' },
    ],
  },
  testEnvironment: 'node',
};
