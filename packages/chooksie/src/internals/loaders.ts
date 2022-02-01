import type { Client, ClientEvents } from 'discord.js'
import type { ChooksScript, Command, Event, OptionWithAutocomplete, SlashSubCommand } from '../types'
import type { AutocompleteStore, Stores } from './resolve'
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
async function loadAutocomplete(store: AutocompleteStore, option: OptionWithAutocomplete, key: string) {
  const deps = await option.setup?.() ?? {}
  const autocomplete = option.autocomplete!.bind(deps)
  store.set(createKey(key, option.name), autocomplete)
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadCommand(stores: Stores, command: Exclude<Command, SlashSubCommand>): Promise<void> {
  const deps = await command.setup?.() ?? {}
  const execute = command.execute.bind(deps)
  stores.command.set(command.name, execute)
  if ('options' in command && Array.isArray(command.options)) {
    for (const opt of command.options) {
      if ('autocomplete' in opt) {
        await loadAutocomplete(stores.autocomplete, opt, command.name)
      }
    }
  }
}

/**
 * @internal **FOR PRODUCTION USE ONLY**.
 */
async function loadSubCommand(stores: Stores, command: SlashSubCommand): Promise<void> {
  for (const option of command.options) {
    if (option.type === 'SUB_COMMAND_GROUP') {
      for (const subcommand of option.options) {
        const deps = await subcommand.setup?.() ?? {}
        const execute = subcommand.execute.bind(deps)
        const key = createKey(command.name, option.name, subcommand.name)
        stores.command.set(key, execute)
        for (const opt of subcommand.options ?? []) {
          if ('autocomplete' in opt) {
            await loadAutocomplete(stores.autocomplete, opt, key)
          }
        }
      }
      continue
    }
    if (option.type === 'SUB_COMMAND') {
      const deps = await option.setup?.() ?? {}
      const execute = option.execute.bind(deps)
      const key = createKey(command.name, option.name)
      stores.command.set(key, execute)
      for (const opt of option.options ?? []) {
        if ('autocomplete' in opt) {
          await loadAutocomplete(stores.autocomplete, opt, key)
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
