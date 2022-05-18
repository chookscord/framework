import type {
  ChooksScript,
  Command,
  CommandModule,
  CommandStore,
  EmptyObject,
  Event,
  GenericHandler,
  Logger,
  MessageCommand,
  Option,
  SlashCommand,
  SlashSubcommand,
  Subcommand,
  SubcommandGroup,
  UserCommand,
} from 'chooksie'
import type { LoggerFactory } from 'chooksie/internals'
import type { Awaitable, Client, ClientEvents } from 'discord.js'
import { randomUUID } from 'node:crypto'
import { relative } from 'node:path'
import { createKey, getAutocompletes, timer } from '../internals'
import type { SourceMap, Store } from '../lib'

export type VoidFn = () => Awaitable<void>
export type CleanupFn = VoidFn

export interface EventModule {
  name: keyof ClientEvents
  execute: VoidFn
  logger: Logger
  updatedAt: number
}

type EventStore = Map<string, EventModule>
type ScriptStore = Map<string, VoidFn>

export interface Stores {
  /** Used for tracking loaded commands */
  module: Store<CommandModule>
  /** Used for storing handlers */
  command: Store<Command>
  /** Stores event listeners for unloading */
  event: Store<EventModule>
  /** Stores cleanup script functions */
  cleanup: Store<VoidFn>
}

function hasOnLoad(mod: Record<string, unknown>): mod is Required<ChooksScript> {
  return typeof mod.chooksOnLoad === 'function'
}

function loadAutocompletes(
  store: CommandStore,
  pino: LoggerFactory,
  data: { parentKey: string; updatedAt: number; options: Option[] | undefined },
) {
  const { parentKey, updatedAt, options } = data

  for (const option of getAutocompletes(options)) {
    const key = createKey('auto', parentKey, option.name)
    const logger = pino('autocomplete', key)

    const setup = option.setup ?? (() => ({}))
    const execute: GenericHandler = async ctx => {
      const deps = await setup()
      await (<GenericHandler>option.autocomplete).call(deps, ctx)
    }

    store.set(key, { execute, logger, updatedAt })
    logger.info(`Autocomplete handler for "${option.name}" at "${parentKey}" loaded.`)
  }
}

function loadSlashCommand(store: CommandStore, pino: LoggerFactory, command: SlashCommand): void {
  const parentKey = createKey(command.name)
  const key = createKey('cmd', parentKey)
  const logger = pino('command', key)

  const setup = command.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>command.execute).call(deps, ctx)
  }

  const updatedAt = Date.now()
  store.set(key, { execute, logger, updatedAt })

  loadAutocompletes(store, pino, {
    parentKey: key,
    updatedAt,
    options: command.options,
  })
}

function loadSubcommand(
  store: CommandStore,
  pino: LoggerFactory,
  data: { parentName: string; subcommand: Subcommand; updatedAt: number },
) {
  const { parentName, subcommand, updatedAt } = data
  const parentKey = createKey(parentName, subcommand.name)
  const key = createKey('cmd', parentKey)
  const logger = pino('subcommand', key)

  const setup = subcommand.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>subcommand.execute).call(deps, ctx)
  }

  store.set(key, { execute, logger, updatedAt })
  logger.info(`Subcommand "${subcommand.name}" loaded.`)

  loadAutocompletes(store, pino, {
    updatedAt,
    parentKey,
    options: subcommand.options,
  })
}

function loadSubcommandGroup(
  store: CommandStore,
  pino: LoggerFactory,
  data: { parentName: string; group: SubcommandGroup; updatedAt: number },
) {
  const { parentName, group, updatedAt } = data

  for (const subcommand of group.options) {
    const parentKey = createKey(parentName, group.name, subcommand.name)
    const key = createKey('cmd', parentKey)
    const logger = pino('subcommand', key)

    const setup = subcommand.setup ?? (() => ({}))
    const execute: GenericHandler = async ctx => {
      const deps = await setup() as EmptyObject
      await (<GenericHandler>subcommand.execute).call(deps, ctx)
    }

    store.set(key, { execute, logger, updatedAt })
    logger.info(`Subcommand "${subcommand.name}" at group "${group.name}" loaded.`)

    loadAutocompletes(store, pino, {
      parentKey,
      updatedAt,
      options: subcommand.options,
    })
  }
}

function loadSlashSubcommand(store: CommandStore, pino: LoggerFactory, command: SlashSubcommand): void {
  const updatedAt = Date.now()
  const parentName = command.name

  for (const option of command.options) {
    if (option.type === 'SUB_COMMAND') {
      const subcommand = <Subcommand>option
      loadSubcommand(store, pino, { updatedAt, parentName, subcommand })
      continue
    }

    if (option.type === 'SUB_COMMAND_GROUP') {
      const group = option
      loadSubcommandGroup(store, pino, { updatedAt, parentName, group })
      continue
    }
  }
}

function loadUserCommand(store: CommandStore, pino: LoggerFactory, command: UserCommand): void {
  const key = createKey('usr', command.name)
  const logger = pino('user', key)

  const setup = command.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>command.execute).call(deps, ctx)
  }

  const updatedAt = Date.now()
  store.set(key, { execute, logger, updatedAt })
  logger.info(`User command "${command.name}" loaded.`)
}

function loadMessageCommand(store: CommandStore, pino: LoggerFactory, command: MessageCommand): void {
  const key = createKey('msg', command.name)
  const logger = pino('message', key)

  const setup = command.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>command.execute).call(deps, ctx)
  }

  const updatedAt = Date.now()
  store.set(key, { execute, logger, updatedAt })
  logger.info(`Message command "${command.name}" loaded.`)
}

function unloadEvent(store: EventStore, client: Client, key: string, logger?: Logger): void {
  if (!store.has(key)) {
    logger?.warn('Tried to unload an event that wasn\'t saved!')
    return
  }

  const event = store.get(key)!
  client.off(event.name, event.execute)
  store.delete(key)

  logger?.info(`Unloaded "${event.name}" listener!`)
}

function loadEvent(
  store: EventStore,
  pino: LoggerFactory,
  data: { client: Client; key: string; event: Event<keyof ClientEvents> },
): void {
  const { client, key, event } = data
  const appLogger = pino('event', event.name)

  const setup = event.setup ?? (() => ({}))
  const execute = async (...args: ClientEvents[keyof ClientEvents]) => {
    const reqId = randomUUID()
    const logger = appLogger.child({ reqId })

    try {
      const deps = await setup()
      logger.info(`Running handler for "${event.name}"...`)

      const endTimer = timer()
      // @ts-ignore: 'this' context blah blah complex type
      await event.execute.call(deps, { client, logger }, ...args)

      logger.info({
        responseTime: endTimer(),
        msg: `Successfully ran handler for "${event.name}".`,
      })
    } catch (error) {
      appLogger.info(`Handler for "${event.name}" did not run successfully.`)

      logger.error('An unexpected error has occured!')
      logger.error(error)
    }
  }

  if (store.has(key)) {
    const old = store.get(key)!
    client.off(old.name, old.execute)
    store.delete(key)
    appLogger.debug(`Deleted old "${old.name}" listener.`)
  }

  store.set(key, {
    name: event.name,
    logger: appLogger,
    updatedAt: Date.now(),
    execute,
  })

  client[event.once ? 'once' : 'on'](event.name, execute)
  appLogger.info(`Registered "${event.name}" listener.`)

  if (event.name === 'ready' && client.isReady()) {
    appLogger.info('Client already logged in. Rerunning "ready" event...')
    client.emit('ready', client)
  }
}

async function unloadScript(store: ScriptStore, logger: Logger, root: string, file: SourceMap): Promise<void> {
  const relpath = relative(root, file.source)
  if (!store.has(relpath)) return

  logger.info(`Starting cleanup at ${relpath}...`)
  try {
    const cleanup = store.get(relpath)!
    await cleanup()
    logger.info(`Finished cleanup at ${relpath}.`)
  } catch (error) {
    logger.error(`Cleanup function at ${relpath} threw an error!`)
    logger.error(error)
  }
}

// eslint-disable-next-line max-params, max-len
async function loadScript(store: ScriptStore, client: Client, pino: LoggerFactory, root: string, file: SourceMap): Promise<void> {
  const relpath = relative(root, file.source)

  // Scripts MUST be cached since track child dependencies from require.cache
  const mod = await import(file.target) as Record<string, unknown>
  if (!hasOnLoad(mod)) return

  const logger = pino('script', relpath)
  logger.info(`Starting lifecycle scripts at ${relpath}...`)

  try {
    // @Choooks22: Long-lived awaited promises (like async generators) are prone to getting stuck.
    // @todo: Add signal for cleanup
    logger.info(`Starting setup at ${relpath}...`)
    const cleanup = await mod.chooksOnLoad({ client, logger })
    logger.info(`Finished running setup function at ${relpath}.`)

    if (cleanup) {
      store.set(relpath, cleanup)
      logger.info('Cleanup function saved.')
    }
  } catch (error) {
    logger.error(error)
    logger.error(`Setup function at ${relpath} threw an error!`)
  }
}

export { loadEvent, loadSlashCommand, loadSlashSubcommand, loadUserCommand, loadMessageCommand, loadScript }
export { unloadEvent, unloadScript }
