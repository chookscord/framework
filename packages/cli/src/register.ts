import type { ChooksConfig, Command } from 'chooksie'
import type { AppCommand } from 'chooksie/internals'
import { access } from 'fs/promises'
import { join, relative } from 'path'
import { setTimeout } from 'timers/promises'
import { walk } from './internals'
import type { SourceMap } from './lib'
import { registerCommands, sourceFromFile, tokenToAppId, transformCommand } from './lib'
import type { RegisterOptions } from './lib/register'

const root = process.cwd()
const outDir = join(root, 'dist')

type ExitCode = number

function fileIsCommand(file: SourceMap) {
  return file.type !== 'config' && file.type !== 'event' && file.type !== 'script'
}

async function _register(opts: RegisterOptions): Promise<ExitCode> {
  const res = await registerCommands(opts)

  if (res.status === 'OK') {
    console.info(`Successfully registered ${opts.commands.length} commands.`)
    return 0
  }

  if (res.status === 'RATE_LIMIT') {
    console.warn(`You're under rate limit! Trying again in ${res.resetAfter}s...`)
    const timeout = res.resetAfter * 1000
    await setTimeout(timeout)
    return _register(opts)
  }

  // Register returned status: ERROR
  console.error('Could not register commands!')
  return 1
}

async function register(): Promise<void> {
  // Check if prod build exists
  await access(outDir)

  // Get config
  console.info('Getting config...')
  const configMod = await import(join(outDir, 'chooks.config.js')) as { default: ChooksConfig }
  const config = configMod.default
  const appId = tokenToAppId(config.token)

  console.info('Loading files...')
  const toSource = sourceFromFile({ root, outDir })
  const commands: AppCommand[] = []

  for await (const file of walk(outDir)) {
    const source = toSource(file.path)
    if (fileIsCommand(source)) {
      const relpath = relative(outDir, file.path)
      try {
        const mod = await import(file.path) as { default: Command }
        commands.push(transformCommand(mod.default))
        console.info(`Loaded ${relpath}`)
      } catch (error) {
        console.error(error)
        console.error(`Could not load file ${relpath}!`)
        process.exit(1)
      }
    }
  }

  console.info(`Found ${commands.length} commands.`)
  console.info('Registering commands...')

  const status = await _register({
    url: `https://discord.com/api/v8/applications/${appId}/commands`,
    credentials: `Bot ${config.token}`,
    commands,
  })

  process.exit(status)
}

export = register
