import type { Interaction } from 'discord.js'
import type { CommandStore, GenericHandler } from '../types'

export interface ResolvedHandler {
  key: string
  execute: GenericHandler | null
}

function createKey(...keys: (string | null)[]): string {
  return keys.filter(Boolean).join(':')
}

function resolveInteraction(store: CommandStore, interaction: Interaction): ResolvedHandler | null {
  if (interaction.isCommand()) {
    const group = interaction.options.getSubcommandGroup(false)
    const subcommand = interaction.options.getSubcommand(false)

    const key = createKey(interaction.commandName, group, subcommand)
    const execute = store.get(key) ?? null

    return { key, execute }
  }

  if (interaction.isContextMenu()) {
    const key = interaction.commandName
    const execute = store.get(key) ?? null

    return { key, execute }
  }

  if (interaction.isAutocomplete()) {
    const group = interaction.options.getSubcommandGroup(false)
    const subcommand = interaction.options.getSubcommand(false)
    const option = interaction.options.getFocused(true)

    const key = createKey(interaction.commandName, group, subcommand, option.name)
    const execute = store.get(key) ?? null

    return { key, execute }
  }

  return null
}

export { createKey, resolveInteraction }
