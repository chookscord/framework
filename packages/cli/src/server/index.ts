import { watch } from 'chokidar'
import type { Command, Event, MessageCommand, SlashCommand, SlashSubcommand, UserCommand } from 'chooksie'
import type { ClientEvents } from 'discord.js'
import type { EventEmitter } from 'events'
import { on as _on } from 'events'
import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join, relative, resolve } from 'path'
import { createClient, createLogger, onInteractionCreate, timer } from '../internals'
import { resolveLocal, sourceFromFile, SourceMap, Store, validateDevConfig } from '../lib'
import { validateEvent, validateMessageCommand, validateSlashCommand, validateSlashSubcommand, validateUserCommand } from '../lib/validation'
import { target } from '../logger'
import { createWatchCompiler } from './compiler'
import { createFileManager } from './file-manager'
import type { Stores } from './loaders'
import { loadEvent, loadMessageCommand, loadScript, loadSlashCommand, loadSlashSubcommand, loadUserCommand, unloadEvent, unloadScript } from './loaders'
import watchCommands from './register'
import { unloadMod } from './require'
import { resolveConfig } from './resolve-config'
resolveLocal('chooksie/dotenv')

const root = process.cwd()
const outDir = join(root, '.chooks')
const cacheDir = join(outDir, '.chooksinfo')
const logs = join(outDir, 'chooks.log')

const fileFromTarget = sourceFromFile({ root, outDir })

const pino = createLogger({
  transport: {
    targets: [
      { target } as never,
      { target: 'pino/file', options: { destination: logs } } as never,
    ],
  },
})

const logger = pino('app', 'chooks')

async function getCached() {
  try {
    const modules = await readFile(cacheDir, 'utf-8')
    const cached = JSON.parse(modules) as [key: string, module: CommandModule][]

    // Filter deleted files since last startup
    return cached.filter(([path]) => existsSync(resolve(path)))
  } catch {
    return []
  }
}

async function validate<T>(mod: T, validator: (mod: T) => Promise<unknown>): Promise<boolean> {
  try {
    await validator(mod)
    return true
  } catch (error) {
    logger.error(error)
    return false
  }
}

function on<T>(emitter: EventEmitter, eventName: string) {
  return _on(emitter, eventName) as AsyncIterableIterator<T>
}

async function createServer(): Promise<void> {
  const measure = timer()
  await mkdir(outDir, { recursive: true })

  logger.info(`Using chooksie v${version}`)
  logger.info('Starting bot...')

  const endDiagnostics = () => {
    logger.info('Logged in!')
    logger.info(`Time Took: ${measure()}ms`)
  }

  return endDiagnostics
}

function syncModulesToCache(modules: Store<CommandModule>) {
  const updateCacheState = async () => {
    const entries = [...modules.entries()]
    const cacheState = JSON.stringify(
      entries,
      (key: string, value: unknown) => key === 'autocomplete' && typeof value === 'function' || value,
    )
    await writeFile(cacheDir, cacheState)
  }

  modules.events.on('add', updateCacheState)
  modules.events.on('delete', updateCacheState)
}

async function newStores() {
  const cachedModules = await getCached()
  const stores: Stores = {
    module: new Store(cachedModules),
    command: new Store(),
    event: new Store(),
    cleanup: new Store(),
  }

  syncModulesToCache(stores.module)
  return stores
}

function newClient(config: ChooksConfig, store: CommandStore) {
  const client = createClient(config)
  const listener = onInteractionCreate(store, pino)
  client.on('interactionCreate', listener)
  return client
}

function newCompiler() {
  const watcher = watch('*/**/*.?(m|c){js,ts}', {
    ignored: ['node_modules', 'dist', 'test?(s)', '.*', '**/*.d.?(m|c)ts'],
    cwd: root,
  })

  return createWatchCompiler(watcher, {
    root,
    outDir,
    createLogger: pino,
  })
}

  const compiler = createWatchCompiler(watcher, { root, outDir, createLogger: pino })
  const listener = onInteractionCreate(stores.command, pino)

  // load modules immediately
  // start scripts only after client login

  // Save state of commands to diff changes on startup
  // This saves unnecessary registers when the bot is started
  const saveState = async () => {
    const modules = [...stores.module.entries()]
    await writeFile(cacheDir, JSON.stringify(
      modules,
      // Replace autocomplete functions to "true" to preserve the field
      (key: string, value: unknown) => key === 'autocomplete' && typeof value === 'function' || value,
    ))
  }

  stores.module.events.on('add', saveState)
  stores.module.events.on('delete', saveState)

  void (async () => {
    for await (const [file] of on<[SourceMap]>(compiler, 'compile')) {
      const relpath = relative(root, file.source)
      const mod = await unrequire<unknown>(file.target)

      const isNew = stores.module.has(relpath)
      logger.info(`File ${relpath} ${isNew ? 'added' : 'updated'}.`)

      if (file.type === 'command') {
        const command = mod.default as SlashCommand
        if (await validate(command, validateSlashCommand)) {
          stores.module.set(relpath, command)
          loadSlashCommand(stores.command, pino, command)
        }
        continue
      }

      if (file.type === 'subcommand') {
        const command = mod.default as SlashSubcommand
        if (await validate(command, validateSlashSubcommand)) {
          stores.module.set(relpath, command)
          loadSlashSubcommand(stores.command, pino, command)
        }
        continue
      }

      if (file.type === 'user') {
        const command = mod.default as UserCommand
        if (await validate(command, validateUserCommand)) {
          command.type ??= 'USER'
          stores.module.set(relpath, command)
          loadUserCommand(stores.command, pino, command)
        }
        continue
      }

      if (file.type === 'message') {
        const command = mod.default as MessageCommand
        if (await validate(command, validateMessageCommand)) {
          command.type ??= 'MESSAGE'
          stores.module.set(relpath, command)
          loadMessageCommand(stores.command, pino, command)
        }
        continue
      }

      if (file.type === 'event') {
        const event = mod.default as Event<keyof ClientEvents>
        if (await validate(event, validateEvent)) {
          loadEvent(stores.event, pino, {
            client,
            key: relpath,
            event,
          })
        }
        continue
      }

      if (file.type === 'script') {
        for (const key of unloadMod(file.target)) {
          const script = fileFromTarget(key)
          await unloadScript(stores.cleanup, logger, root, script)
          await loadScript(stores.cleanup, client, pino, root, script)
        }
        continue
      }
    }
  })()

  void (async () => {
    for await (const [file] of on<[SourceMap]>(compiler, 'delete')) {
      const relpath = relative(root, file.source)
      if (file.type === 'event') {
        unloadEvent(stores.event, client, relpath, logger)
      }

      if (file.type === 'script') {
        await unloadScript(stores.cleanup, logger, root, file)
        continue
      }

      // No need to handle commands since it's handled by the module register.
      if (file.type !== 'config') {
        stores.module.delete(relpath)
        continue
      }
    }
  })()

  await login
  const responseTime = measure()

  logger.info('Logged in!')
  logger.info(`Time Took: ${responseTime}ms`)
}

async function main(): Promise<void> {
  const end = diagnostics()
  await mkdir(outDir, { recursive: true })
  const config = await resolveConfig(
    { root, outDir },
    { validator: validateDevConfig },
  )

  const stores = await newStores()
  const client = newClient(config, stores.command)
  const login = client.login(config.token)

  newFileManager(client, stores)
  watchCommands(stores, config.token, config.devServer!, pino)

  await login
  end()
}

export = main

if ('CHOOKSIE_CLI_VERSION' in process.env) {
  // bootstrap self when forked from CLI
  void main()
}
