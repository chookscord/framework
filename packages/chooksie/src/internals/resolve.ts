import type { AutocompleteInteraction, Awaitable, Interaction } from 'discord.js'
import type { Command, CommandContext, GenericHandler, SlashSubCommand } from '../types'

export type CommandStore = Map<string, OmitThisParameter<Exclude<Command, SlashSubCommand>['execute']>>
export type AutocompleteStore = Map<string, (ctx: CommandContext<AutocompleteInteraction>) => Awaitable<void>>

export interface Stores {
  command: CommandStore
  autocomplete: AutocompleteStore
}

export interface ResolvedHandler {
  key: string
  execute: GenericHandler | null
}

function createKey(...keys: (string | null)[]): string {
  return keys.filter(Boolean).join(':')
}

function resolveInteraction(stores: Stores, interaction: Interaction): ResolvedHandler | null {
  if (interaction.isCommand()) {
    const group = interaction.options.getSubcommandGroup(false)
    const subcommand = interaction.options.getSubcommand(false)

    const key = createKey(interaction.commandName, group, subcommand)
    const execute = <GenericHandler>stores.command.get(key) ?? null

    return { key, execute }
  }

  if (interaction.isContextMenu()) {
    const key = interaction.commandName
    const execute = <GenericHandler>stores.command.get(key) ?? null

    return { key, execute }
  }

  if (interaction.isAutocomplete()) {
    const group = interaction.options.getSubcommandGroup(false)
    const subcommand = interaction.options.getSubcommand(false)
    const option = interaction.options.getFocused(true)

    const key = createKey(interaction.commandName, group, subcommand, option.name)
    const execute = <GenericHandler>stores.autocomplete.get(key) ?? null

    return { key, execute }
  }

  return null
}

export { createKey, resolveInteraction }
