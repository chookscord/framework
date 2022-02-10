import type { ChooksScript, Command, CommandStore, EmptyObject, Event, GenericHandler, MessageCommand, Option, SlashCommand, SlashSubcommand, Subcommand, SubcommandGroup, UserCommand } from 'chooksie'
import { getAutocompletes } from 'chooksie/internals'
import type { Awaitable, Client, ClientEvents } from 'discord.js'
import { relative } from 'path'
import { createKey } from '../internals'
import type { SourceMap, Store } from '../lib'

type EventStore = Map<string, () => Awaitable<void>>
type ScriptStore = Map<string, () => Awaitable<void>>

export interface Stores {
  /** Used for tracking loaded commands */
  module: Store<Command>
  /** Used for storing handlers */
  command: Store<GenericHandler>
  /** Stores event listeners for unloading */
  event: Store<() => Awaitable<void>>
  /** Stores cleanup script functions */
  cleanup: Store<() => Awaitable<void>>
}

function hasOnLoad(mod: Record<string, unknown>): mod is Required<ChooksScript> {
  return typeof mod.chooksOnLoad === 'function'
}

function loadAutocompletes(store: CommandStore, parentKey: string, options: Option[] | undefined) {
  for (const option of getAutocompletes(options)) {
    const setup = option.setup ?? (() => ({}))
    const execute: GenericHandler = async ctx => {
      const deps = await setup()
      await (<GenericHandler>option.autocomplete).call(deps, ctx)
    }

    const key = createKey('auto', parentKey, option.name)
    store.set(key, execute)
  }
}

function loadSlashCommand(store: CommandStore, command: SlashCommand): void {
  const parentKey = createKey(command.name)
  const key = createKey('cmd', parentKey)

  const setup = command.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>command.execute).call(deps, ctx)
  }

  store.set(key, execute)
  loadAutocompletes(store, parentKey, command.options)
}

function loadSubcommand(store: CommandStore, parentName: string, subcommand: Subcommand) {
  const parentKey = createKey(parentName, subcommand.name)
  const key = createKey('cmd', parentKey)

  const setup = subcommand.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>subcommand.execute).call(deps, ctx)
  }

  store.set(key, execute)
  loadAutocompletes(store, parentKey, subcommand.options)
}

function loadSubcommandGroup(store: CommandStore, parentName: string, group: SubcommandGroup) {
  for (const subcommand of group.options) {
    const parentKey = createKey(parentName, group.name, subcommand.name)
    const key = createKey('cmd', parentKey)

    const setup = subcommand.setup ?? (() => ({}))
    const execute: GenericHandler = async ctx => {
      const deps = await setup() as EmptyObject
      await (<GenericHandler>subcommand.execute).call(deps, ctx)
    }

    store.set(key, execute)
    loadAutocompletes(store, parentKey, subcommand.options)
  }
}

function loadSlashSubcommand(store: CommandStore, command: SlashSubcommand): void {
  for (const option of command.options) {
    if (option.type === 'SUB_COMMAND') {
      loadSubcommand(store, command.name, option as Subcommand)
      continue
    }

    if (option.type === 'SUB_COMMAND_GROUP') {
      loadSubcommandGroup(store, command.name, option)
      continue
    }
  }
}

function loadUserCommand(store: CommandStore, command: UserCommand): void {
  const setup = command.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>command.execute).call(deps, ctx)
  }

  store.set(createKey('usr', command.name), execute)
}

function loadMessageCommand(store: CommandStore, command: MessageCommand): void {
  const setup = command.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>command.execute).call(deps, ctx)
  }

  store.set(createKey('msg', command.name), execute)
}

function loadEvent(store: EventStore, client: Client, event: Event<keyof ClientEvents>): void {
  const setup = event.setup ?? (() => ({}))
  const execute = async (...args: ClientEvents[keyof ClientEvents]) => {
    const deps = await setup()
    // @ts-ignore: 'this' context blah blah complex type
    await event.execute.call(deps, { client }, ...args)
  }

  const oldListener = store.get(event.name)
  if (oldListener) {
    client.off(event.name, oldListener as never)
  }

  store.set(event.name, execute)
  client[event.once ? 'once' : 'on'](event.name, execute)
}

async function unloadScript(store: ScriptStore, root: string, file: SourceMap): Promise<void> {
  const relpath = relative(root, file.source)
  const oldCleanup = store.get(file.source)
  if (oldCleanup) {
    try {
      await oldCleanup()
    } catch (error) {
      console.error(`Cleanup function at ${relpath} threw an error!`)
      console.error(error)
    }
  }
}

async function loadScript(store: ScriptStore, client: Client, file: SourceMap): Promise<void> {
  // Scripts MUST be cached since track child dependencies from require.cache
  const mod = await import(file.target) as Record<string, unknown>
  if (!hasOnLoad(mod)) return

  const newCleanup = await mod.chooksOnLoad({ client })
  if (newCleanup) {
    store.set(file.source, newCleanup)
  }
}

export { loadEvent, loadSlashCommand, loadSlashSubcommand, loadUserCommand, loadMessageCommand, loadScript }
export { unloadScript }
