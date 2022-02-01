import type { AutocompleteInteraction, Awaitable, Interaction } from 'discord.js'
import type { Command, CommandContext, GenericHandler, SlashSubCommand } from '../types'

export type CommandStore = Map<string, OmitThisParameter<Exclude<Command, SlashSubCommand>['execute']>>
export type AutocompleteStore = Map<string, (ctx: CommandContext<AutocompleteInteraction>) => Awaitable<void>>

export interface Stores {
  command: CommandStore
  autocomplete: AutocompleteStore
}

function createKey(...keys: (string | null)[]): string {
  return keys.filter(Boolean).join(':')
}

function resolveInteraction(stores: Stores, interaction: Interaction): GenericHandler | null {
  if (interaction.isCommand()) {
    const group = interaction.options.getSubcommandGroup(false)
    const subcommand = interaction.options.getSubcommand(false)
    const key = createKey(interaction.commandName, group, subcommand)
    return <GenericHandler>stores.command.get(key) ?? null
  }

  if (interaction.isContextMenu()) {
    const key = interaction.commandName
    return <GenericHandler>stores.command.get(key) ?? null
  }

  if (interaction.isAutocomplete()) {
    const group = interaction.options.getSubcommandGroup(false)
    const subcommand = interaction.options.getSubcommand(false)
    const option = interaction.options.getFocused(true)
    const key = createKey(interaction.commandName, group, subcommand, option.name)
    return <GenericHandler>stores.autocomplete.get(key) ?? null
  }

  return null
}

export { createKey, resolveInteraction }
