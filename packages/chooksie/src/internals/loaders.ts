import type { Client, ClientEvents } from 'discord.js'
import _pino from 'pino'
import type { ChooksScript, CommandStore, EmptyObject, Event, GenericHandler, MessageCommand, Option, OptionWithAutocomplete, SlashCommand, SlashSubcommand, Subcommand, SubcommandGroup, UserCommand } from '../types'
import { createKey } from './resolve'

const pino = _pino()

function getAutocompletes(options: Option[] | undefined): OptionWithAutocomplete[] {
  if (!options) return []

  return options.filter((option): option is OptionWithAutocomplete => {
    return 'autocomplete' in option && typeof option.autocomplete === 'function'
  })
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadEvent(client: Client, event: Event<keyof ClientEvents>): Promise<void> {
  const freq = event.once ? 'once' : 'on'
  const deps = await event.setup?.() ?? {}

  const logger = pino.child({ type: 'event', name: event.name })
  const execute = event.execute.bind(deps, { client, logger })

  client[freq](event.name, execute)
}

async function loadAutocompletes(store: CommandStore, parentKey: string, options: Option[] | undefined) {
  const autocompletes = getAutocompletes(options)
  if (!autocompletes.length) return

  const jobs = autocompletes.map(async option => {
    const deps = await option.setup?.() ?? {}
    const autocomplete = <GenericHandler>option.autocomplete!.bind(deps)

    const key = createKey('auto', parentKey, option.name)
    const logger = pino.child({ type: 'autocomplete', name: key })

    store.set(key, { execute: autocomplete, logger })
  })

  await Promise.all(jobs)
}

async function loadSlashCommand(store: CommandStore, command: SlashCommand): Promise<void> {
  const deps = await command.setup?.() ?? {}
  const execute = <GenericHandler>command.execute.bind(deps)

  const key = createKey('cmd', command.name)
  const logger = pino.child({ type: 'command', name: key })

  store.set(key, { execute, logger })

  await loadAutocompletes(store, command.name, command.options)
}

async function loadSubcommand(store: CommandStore, parentName: string, subcommand: Subcommand) {
  const deps = await subcommand.setup?.() ?? {}
  const execute = <GenericHandler>subcommand.execute.bind(deps)

  const parentKey = createKey(parentName, subcommand.name)
  const key = createKey('cmd', parentKey)
  const logger = pino.child({ type: 'subcommand', name: key })
  store.set(key, { execute, logger })

  await loadAutocompletes(store, parentKey, subcommand.options)
}

async function loadSubcommandGroup(store: CommandStore, parentName: string, group: SubcommandGroup) {
  const subcommands = group.options.map(async subcommand => {
    const deps = await subcommand.setup?.() as EmptyObject ?? {}
    const execute = <GenericHandler>subcommand.execute.bind(deps)

    const parentKey = createKey(parentName, group.name, subcommand.name)
    const key = createKey('cmd', parentKey)
    const logger = pino.child({ type: 'subcommand', name: key })
    store.set(key, { execute, logger })

    await loadAutocompletes(store, parentKey, subcommand.options)
  })

  await Promise.all(subcommands)
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadSlashSubcommand(store: CommandStore, command: SlashSubcommand): Promise<void> {
  const options = command.options.map(async option => {
    if (option.type === 'SUB_COMMAND') {
      await loadSubcommand(store, command.name, option as Subcommand)
      return
    }

    if (option.type === 'SUB_COMMAND_GROUP') {
      await loadSubcommandGroup(store, command.name, option)
      return
    }
  })

  await Promise.all(options)
}

/**
 * @internal **FOR PRODUCTION USE ONLY**
 */
async function loadUserCommand(store: CommandStore, command: UserCommand): Promise<void> {
  const deps = await command.setup?.() ?? {}
  const execute = <GenericHandler>command.execute.bind(deps)

  const key = createKey('usr', command.name)
  const logger = pino.child({ type: 'user', name: key })

  store.set(key, { execute, logger })
}

/**
 * @internal **FOR PRODUCTION USE ONLY**
 */
async function loadMessageCommand(store: CommandStore, command: MessageCommand): Promise<void> {
  const deps = await command.setup?.() ?? {}
  const execute = <GenericHandler>command.execute.bind(deps)

  const key = createKey('msg', command.name)
  const logger = pino.child({ type: 'message', name: key })

  store.set(key, { execute, logger })
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadScript(client: Client, relpath: string, script: ChooksScript): Promise<void> {
  if (typeof script.chooksOnLoad === 'function') {
    const logger = pino.child({ type: 'script', name: relpath })
    await script.chooksOnLoad({ client, logger })
  }
}

export { loadEvent, loadSlashCommand, loadSlashSubcommand, loadUserCommand, loadMessageCommand, loadScript }
export { getAutocompletes }
