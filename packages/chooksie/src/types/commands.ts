import type {
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js'
import type {
  BaseCommand,
  EmptyObject,
} from './base.js'
import type { InteractionContext } from './contexts.js'
import type {
  BasicOption,
  SubcommandOption,
} from './options.js'
import type {
  WithDescription,
  WithExecute, WithOptions,
} from './shared.js'

export interface SlashCommand<T = EmptyObject> extends
  BaseCommand,
  WithDescription,
  WithExecute<InteractionContext<ChatInputCommandInteraction>, T>,
  Partial<WithOptions<BasicOption>> {
}

export interface SlashSubcommand extends
  BaseCommand,
  WithDescription,
  WithOptions<SubcommandOption> {
}

export interface UserCommand<T = EmptyObject> extends
  BaseCommand,
  WithExecute<InteractionContext<UserContextMenuCommandInteraction>, T> {
}

export interface MessageCommand<T = EmptyObject> extends
  BaseCommand,
  WithExecute<InteractionContext<MessageContextMenuCommandInteraction>, T> {
}
