import type { SlashCommand, GenericHandler, Subcommand, SubcommandGroup, EmptyObject, SlashSubcommand, UserCommand, MessageCommand, Event, Command, ChooksScript, CommandStore } from 'chooksie'
import { createKey } from '../internals'
import type { Awaitable, Client, ClientEvents } from 'discord.js'
import { relative } from 'path'
import type { SourceMap, Store } from '../lib'
import { unrequire } from './require'

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

function loadSlashCommand(store: CommandStore, command: SlashCommand): void {
  const setup = command.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>command.execute).call(deps, ctx)
  }

  // @todo: autocompletes
  store.set(createKey('cmd', command.name), execute)
}

function loadSubcommand(store: CommandStore, parentName: string, subcommand: Subcommand) {
  const key = createKey('cmd', parentName, subcommand.name)

  const setup = subcommand.setup ?? (() => ({}))
  const execute: GenericHandler = async ctx => {
    const deps = await setup()
    await (<GenericHandler>subcommand.execute).call(deps, ctx)
  }

  // @todo: autocompletes
  store.set(key, execute)
}

function loadSubcommandGroup(store: CommandStore, parentName: string, group: SubcommandGroup) {
  for (const subcommand of group.options) {
    const key = createKey('cmd', parentName, group.name, subcommand.name)

    const setup = subcommand.setup ?? (() => ({}))
    const execute: GenericHandler = async ctx => {
      const deps = await setup() as EmptyObject
      await (<GenericHandler>subcommand.execute).call(deps, ctx)
    }

    // @todo: autocompletes
    store.set(key, execute)
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
  // @todo: recursively refresh children as well
  const mod = await unrequire(file.target) as Record<string, unknown>
  if (!hasOnLoad(mod)) return

  const newCleanup = await mod.chooksOnLoad({ client })
  if (newCleanup) {
    store.set(file.source, newCleanup)
  }
}

export { loadEvent, loadSlashCommand, loadSlashSubcommand, loadUserCommand, loadMessageCommand, loadScript }
export { unloadScript }
