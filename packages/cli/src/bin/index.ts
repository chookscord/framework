#! /usr/bin/env node
const _emitWarning = process.emitWarning // eslint-disable-line @typescript-eslint/unbound-method
process.emitWarning = () => { /*  */ }
const { default: chooksie } = await import('chooksie/package.json', { assert: { type: 'json' } })
const { default: cli } = await import('../../package.json', { assert: { type: 'json' } })
process.emitWarning = _emitWarning

// Set default env as production
process.env.NODE_ENV = 'production'

process.env.CHOOKSIE_CLI_VERSION = cli.version
process.env.CHOOKSIE_VERSION = chooksie.version

import { program } from 'commander'

async function dev() {
  const child = await import('node:child_process')
  const script = new URL('../server/index.js', import.meta.url).pathname

  child.fork(script, {
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
    execArgv: [
      '--title=chooksie',
      '--experimental-vm-modules',
      '--enable-source-maps',
    ],
  })
}

function init() {
  throw new Error('command not implemented')
}

function build() {
  throw new Error('command not implemented')
}

function register() {
  throw new Error('command not implemented')
}

program
  .name('chooks')
  .description(cli.description)
  .version(`chooksie: ${chooksie.version}\n@chookscord/cli: ${cli.version}`, '-v, --version')

program
  .command('dev')
  .description('starts your application in development mode')
  .action(dev)

program
  .command('init')
  .description('creates a new application')
  .action(init)

program
  .command('build')
  .description('creates a production build of your application')
  .action(build)

program
  .command('register')
  .description('registers your Discord application commands globally')
  .action(register)

program.parse(process.argv)
