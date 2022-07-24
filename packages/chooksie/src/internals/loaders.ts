import type { Client, ClientEvents, MessageComponentInteraction } from 'discord.js'
import { createLogger } from '../logger.js'
import type {
  CommandContext,
  CommandStore,
  ContextMenuCommand,
  EmptyObject,
  Event,
  GenericHandler,
  GenericHandlerExecute,
  Handlers,
  LifecycleEvents, NonCommandOption,
  OptionWithAutocomplete,
  SlashCommand,
  SlashSubcommand,
  Subcommand,
  SubcommandGroup,
} from '../types.js'
import timer from './chrono.js'
import genId from './id.js'
import { createKey } from './resolve.js'

/**
 * # DO NOT TOUCH
 *
 * Only used for passing to lifecycles.
 * @internal
 */
const signal = new AbortSignal()

const nsMap = {
  user: 'usr',
  message: 'msg',
  button: 'btn',
  modal: 'modal',
} as const

function withPayload(execute: GenericHandlerExecute) {
  return ((ctx: CommandContext<MessageComponentInteraction>) => {
    const sep = ctx.interaction.customId.indexOf('|') + 1
    return sep > 0
      ? execute({ ...ctx, payload: ctx.interaction.customId.slice(sep) })
      : execute({ ...ctx, payload: null })
  }) as GenericHandler
}

export function* getAutocompletes(options: NonCommandOption[]): Generator<OptionWithAutocomplete, void> {
  for (const option of options) {
    if ('autocomplete' in option && typeof option.autocomplete === 'function') {
      yield option
    }
  }
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
export async function loadEvent(client: Client, event: Event<keyof ClientEvents>): Promise<void> {
  const freq = event.once ? 'once' : 'on'
  const deps = await event.setup?.() ?? {}

  const _logger = createLogger('event', event.name)
  const _execute = event.execute.bind(deps)

  const execute = async (...args: ClientEvents[keyof ClientEvents]) => {
    const id = genId()
    const logger = _logger.child({ reqId: id })

    try {
      logger.info(`Running handler for "${event.name}"...`)

      const endTimer = timer()
      // @ts-ignore: 'this' context blah blah complex type
      await _execute({ id, client, logger }, ...args)

      logger.info({
        responseTime: endTimer(),
        msg: `Successfully ran handler for "${event.name}".`,
      })
    } catch (error) {
      _logger.info(`Handler for "${event.name}" did not run successfully.`)

      logger.error('An unexpected error has occured!')
      logger.error(error)
    }
  }

  client[freq](event.name, execute)
}

async function loadAutocompletes(store: CommandStore, parentKey: string, options: NonCommandOption[]) {
  for (const autocomplete of getAutocompletes(options)) {
    const deps = await autocomplete.setup?.() ?? {}
    const execute = autocomplete.autocomplete!.bind(deps) as GenericHandler

    const key = createKey('auto', parentKey, autocomplete.name)
    const logger = createLogger('autocomplete', key)

    store.set(key, { execute, logger })
  }
}

export async function loadSlashCommand(store: CommandStore, command: SlashCommand): Promise<void> {
  const deps = await command.setup?.() ?? {}
  const execute = command.execute.bind(deps) as GenericHandler

  const key = createKey('cmd', command.name)
  const logger = createLogger('command', key)

  store.set(key, { execute, logger })

  if (command.options !== undefined) {
    await loadAutocompletes(store, command.name, command.options)
  }
}

async function loadSubcommand(store: CommandStore, parentName: string, groupName: string | null, option: Subcommand) {
  const deps = await option.setup?.() ?? {}
  const execute = option.execute.bind(deps) as GenericHandler

  const parentKey = createKey(parentName, groupName, option.name)
  const key = createKey('cmd', parentKey)
  const logger = createLogger('subcommand', key)

  store.set(key, { execute, logger })

  if (option.options !== undefined) {
    await loadAutocompletes(store, parentKey, option.options)
  }
}

async function loadSubcommandGroup(store: CommandStore, parentName: string, group: SubcommandGroup) {
  for (const option of group.options) {
    await loadSubcommand(store, parentName, group.name, option as Subcommand)
  }
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
export async function loadSlashSubcommand(store: CommandStore, command: SlashSubcommand): Promise<void> {
  for (const option of command.options) {
    if (option.type === 'SUB_COMMAND') {
      await loadSubcommand(store, command.name, null, option as Subcommand)
      return
    }

    if (option.type === 'SUB_COMMAND_GROUP') {
      await loadSubcommandGroup(store, command.name, option)
      return
    }
  }
}

/**
 * @internal **FOR PRODUCTION USE ONLY**
 */
export async function loadContextMenuCommand(store: CommandStore, type: 'user' | 'message', command: ContextMenuCommand): Promise<void> {
  const key = createKey(nsMap[type], command.name)
  const deps = await command.setup?.() as EmptyObject ?? {}

  store.set(key, {
    execute: command.execute.bind(deps) as GenericHandler,
    logger: createLogger(type, key),
  })
}

/**
 * @internal **FOR PRODUCTION USE ONLY**
 */
export async function loadHandler(store: CommandStore, type: 'button' | 'modal', handler: Handlers): Promise<void> {
  const key = createKey(nsMap[type], handler.customId)
  const deps = await handler.setup?.() ?? {}

  store.set(key, {
    execute: withPayload(handler.execute.bind(deps) as GenericHandlerExecute),
    logger: createLogger(type, key),
  })
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
export async function loadLifecycle(client: Client, filename: string, script: LifecycleEvents): Promise<void> {
  if (typeof script.chooksOnLoad === 'function') {
    const id = genId()
    const logger = createLogger('script', filename)
    await script.chooksOnLoad({ id, client, logger, signal })
  }
}
