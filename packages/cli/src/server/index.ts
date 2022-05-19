import { watch } from 'chokidar'
import type { ChooksConfig, CommandModule, CommandStore } from 'chooksie'
import type { Client } from 'discord.js'
import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { once } from 'node:events'
import { join, resolve } from 'node:path'
import { createClient, createLogger, onInteractionCreate, timer } from '../internals'
import { resolveLocal, sourceFromFile, Store, validateDevConfig } from '../lib'
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

/**
 * start sequence:
 * 1. Log diagnostics
 * 2. Init build artifacts dir
 * 3. Resolve user's config
 * 4. Init components:
 *   - stores
 *   - djs client[1]
 *   - file watcher[2]
 * 5. Load files
 * 6. Wait for login
 */
function diagnostics() {
  const measure = timer()
  const { version } = resolveLocal<{ version: string }>('chooksie/package.json')

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

function newFileManager(client: Client, stores: Stores) {
  const compiler = newCompiler()
  const fm = createFileManager(compiler, { root, outDir })
  const ready = once(client, 'ready')

  // load modules immediately
  // start scripts only after client login

  fm.on('create', (_, path) => {
    if (stores.module.has(path)) {
      logger.info(`File ${path} updated.`)
    } else {
      logger.info(`File ${path} added.`)
    }
  })

  fm.on('commandCreate', async (mod, path) => {
    if (await validate(mod, validateSlashCommand)) {
      stores.module.set(path, mod)
      loadSlashCommand(stores.command, pino, mod)
    }
  })

  fm.on('subcommandCreate', async (mod, path) => {
    if (await validate(mod, validateSlashSubcommand)) {
      stores.module.set(path, mod)
      loadSlashSubcommand(stores.command, pino, mod)
    }
  })

  fm.on('userCreate', async (mod, path) => {
    if (await validate(mod, validateUserCommand)) {
      mod.type ??= 'USER'
      stores.module.set(path, mod)
      loadUserCommand(stores.command, pino, mod)
    }
  })

  fm.on('messageCreate', async (mod, path) => {
    if (await validate(mod, validateMessageCommand)) {
      mod.type ??= 'MESSAGE'
      stores.module.set(path, mod)
      loadMessageCommand(stores.command, pino, mod)
    }
  })

  fm.on('eventCreate', async (event, relpath) => {
    if (await validate(event, validateEvent)) {
      loadEvent(stores.event, pino, { client, key: relpath, event })
    }
  })

  fm.on('scriptCreate', async (path, file) => {
    // @Choooks22: we're taking chances here that ALL scripts have been read
    // before client has logged in, could do something funky on slow(?) drives
    if (!client.isReady()) {
      await ready
      await loadScript(stores.cleanup, client, pino, root, file)
    } else {
      for (const unloadedKey of unloadMod(file.target)) {
        const script = fileFromTarget(unloadedKey)
        await unloadScript(stores.cleanup, logger, root, script)
        await loadScript(stores.cleanup, client, pino, root, script)
      }
    }
  })

  fm.on('delete', (type, path, file) => {
    switch (type) {
      case 'event':
        unloadEvent(stores.event, client, path, logger)
        break
      case 'script':
        void unloadScript(stores.cleanup, logger, root, file)
        break
      case 'config':
        // @todo: live reload server
        logger.info('Config file has been updated. Please restart for changes to take effect.')
        break
      default:
        stores.module.delete(path)
    }
  })

  return fm
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
