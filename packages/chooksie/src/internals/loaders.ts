import type { Client, ClientEvents } from 'discord.js'
import type { ChooksScript, Command, CommandStore, Event, GenericHandler, OptionWithAutocomplete, SlashSubCommand } from '../types'
import { createKey } from './resolve'

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadEvent(client: Client, event: Event<keyof ClientEvents>): Promise<void> {
  const freq = event.once ? 'once' : 'on'
  const deps = await event.setup?.() ?? {}
  const execute = event.execute.bind(deps, { client })
  client[freq](event.name, execute)
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadAutocomplete(store: CommandStore, option: OptionWithAutocomplete, key: string) {
  const deps = await option.setup?.() ?? {}
  const autocomplete = <GenericHandler>option.autocomplete!.bind(deps)
  store.set(createKey(key, option.name), autocomplete)
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadCommand(store: CommandStore, command: Exclude<Command, SlashSubCommand>): Promise<void> {
  const deps = await command.setup?.() ?? {}
  const execute = <GenericHandler>command.execute.bind(deps)
  store.set(command.name, execute)
  if ('options' in command && Array.isArray(command.options)) {
    for (const opt of command.options) {
      if ('autocomplete' in opt) {
        await loadAutocomplete(store, opt, command.name)
      }
    }
  }
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadSubCommand(store: CommandStore, command: SlashSubCommand): Promise<void> {
  for (const option of command.options) {
    if (option.type === 'SUB_COMMAND_GROUP') {
      for (const subcommand of option.options) {
        const deps = await subcommand.setup?.() ?? {}
        const execute = <GenericHandler>subcommand.execute.bind(deps)
        const key = createKey(command.name, option.name, subcommand.name)
        store.set(key, execute)
        for (const opt of subcommand.options ?? []) {
          if ('autocomplete' in opt) {
            await loadAutocomplete(store, opt, key)
          }
        }
      }
      continue
    }
    if (option.type === 'SUB_COMMAND') {
      const deps = await option.setup?.() ?? {}
      const execute = <GenericHandler>option.execute.bind(deps)
      const key = createKey(command.name, option.name)
      store.set(key, execute)
      for (const opt of option.options ?? []) {
        if ('autocomplete' in opt) {
          await loadAutocomplete(store, opt, key)
        }
      }
    }
  }
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadScript(client: Client, script: ChooksScript): Promise<void> {
  if (typeof script.chooksOnLoad === 'function') {
    await script.chooksOnLoad({ client })
  }
}

export { loadEvent, loadCommand, loadSubCommand, loadScript }
