import type { ChooksConfig, CommandModule, MessageCommand, UserCommand } from 'chooksie'
import type { AppCommand } from 'chooksie/internals'
import { createLogger, walk } from 'chooksie/internals'
import { access } from 'fs/promises'
import { join, relative } from 'path'
import { setTimeout } from 'timers/promises'
import type { SourceMap } from './lib/index.js'
import { registerCommands, resolveLocal, sourceFromFile, tokenToAppId, transformModule } from './lib/index.js'
import type { RegisterOptions } from './lib/register.js'
import { target } from './logger.js'
resolveLocal('chooksie/dotenv')

const root = process.cwd()
const outDir = join(root, 'dist')

const version = resolveLocal<{ version: string }>('chooksie/package.json').version

const pino = createLogger({
  transport: { target },
})

const logger = pino('app', 'chooks')

type ExitCode = number

async function resolveMod(file: SourceMap): Promise<CommandModule | null> {
  if (file.type === 'user') {
    const mod = await import(file.target) as { default: UserCommand }
    return { type: 'USER', ...mod.default }
  }

  if (file.type === 'message') {
    const mod = await import(file.target) as { default: MessageCommand }
    return { type: 'MESSAGE', ...mod.default }
  }

  if (file.type === 'command' || file.type === 'subcommand') {
    const mod = await import(file.target) as { default: CommandModule }
    return mod.default
  }

  return null
}

async function _register(opts: RegisterOptions): Promise<ExitCode> {
  const res = await registerCommands(opts)

  if (res.status === 'OK') {
    logger.info(`Successfully registered ${opts.commands.length} commands.`)
    return 0
  }

  if (res.status === 'RATE_LIMIT') {
    logger.warn(`You're under rate limit! Trying again in ${res.resetAfter}s...`)
    const timeout = res.resetAfter * 1000
    await setTimeout(timeout)
    return _register(opts)
  }

  // Register returned status: ERROR
  logger.error('Could not register commands!')
  return 1
}

async function register(): Promise<void> {
  logger.info(`Using chooksie v${version}`)
  // Check if prod build exists
  await access(outDir)

  // Get config
  logger.info('Getting config...')
  const configMod = await import(join(outDir, 'chooks.config.js')) as { default: ChooksConfig }
  const config = configMod.default
  const appId = tokenToAppId(config.token)

  logger.info('Loading files...')
  const toSource = sourceFromFile({ root, outDir })
  const commands: AppCommand[] = []

  for await (const file of walk(outDir)) {
    const relpath = relative(outDir, file.path)
    const source = toSource(file.path)
    let command: CommandModule | null

    try {
      logger.debug(`Loading ${relpath}...`)
      command = await resolveMod(source)
      if (command === null) continue
    } catch (error) {
      logger.fatal(error)
      logger.fatal(`Could not load file ${relpath}!`)
      process.exit(1)
    }

    commands.push(transformModule(command))
    logger.info(`Loaded ${relpath}`)
  }

  logger.info(`Found ${commands.length} commands.`)
  logger.info('Registering commands...')

  const status = await _register({
    url: `https://discord.com/api/v8/applications/${appId}/commands`,
    credentials: `Bot ${config.token}`,
    commands,
    logger: pino('app', 'register'),
  })

  process.exit(status)
}

export default register
