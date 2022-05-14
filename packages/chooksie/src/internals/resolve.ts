import type { Interaction } from 'discord.js'
import type { Command, CommandStore } from '../types'

export interface ResolvedHandler {
  key: string
  command: Command | null
}

function createKey(ns: string, ...keys: (string | null)[]): string {
  let key = ns
  for (let i = 0, n = keys.length; i < n; i++) {
    if (keys[i] !== null) {
      key += `:${keys[i]}`
    }
  }
  return key
}

function resolveInteraction(store: CommandStore, interaction: Interaction): ResolvedHandler | null {
  if (interaction.isCommand()) {
    const group = interaction.options.getSubcommandGroup(false)
    const subcommand = interaction.options.getSubcommand(false)

    const key = createKey('cmd', interaction.commandName, group, subcommand)
    const command = store.get(key) ?? null

    return { key, command }
  }

  if (interaction.isContextMenu()) {
    const namespace = interaction.isUserContextMenu() ? 'usr' : 'msg'
    const key = createKey(namespace, interaction.commandName)
    const command = store.get(key) ?? null

    return { key, command }
  }

  if (interaction.isAutocomplete()) {
    const group = interaction.options.getSubcommandGroup(false)
    const subcommand = interaction.options.getSubcommand(false)
    const option = interaction.options.getFocused(true)

    const key = createKey('auto', interaction.commandName, group, subcommand, option.name)
    const command = store.get(key) ?? null

    return { key, command }
  }

  return null
}

export { createKey, resolveInteraction }
