#! /usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const command = process.argv.slice(2)[0]

if (!command) {
  const child = require('node:child_process')
  const script = require.resolve('../server')

  const env = {
    CHOOKSIE_CLI: '',
    CHOOKSIE_UNDICI_PATH: require.resolve('undici'),
    NODE_ENV: 'development',
    CHOOKSIE_VERSION: require('../../package.json').version,
  }

  child.fork(script, {
    env: {
      ...process.env,
      ...env, // Inject custom env
    },
    execArgv: ['--enable-source-maps', '--title=chooksie'],
  })
} else if (command === 'init') {
  process.env.CHOOKSIE_CLI = ''
  // eslint-disable-next-line no-eval
  eval('import("create-chooks-bot")')
} else if (command === 'build') {
  const build = require('../build')
  void build()
} else if (command === 'register') {
  const register = require('../register')
  void register()
} else {
  const error = new Error('Invalid command.')
  console.error(error)
  process.exit(1)
}
