#! /usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const args = process.argv.slice(2)
const command = args[0]

const version = require('../../package.json').version
if (args.includes('-v') || args.includes('--v')) {
  console.info(`v${version}`)
  process.exit(0)
}

process.env.CHOOKSIE_CLI_VERSION = version
process.env.CHOOKSIE_UNDICI_PATH = require.resolve('undici')

// Set default env as production
process.env.NODE_ENV = 'production'

if (!command) {
  const child = require('node:child_process')
  const script = require.resolve('../server')

  child.fork(script, {
    env: {
      ...process.env,
      // Override default env as development
      NODE_ENV: 'development',
    },
    execArgv: ['--enable-source-maps', '--title=chooksie'],
  })
} else if (command === 'init') {
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
