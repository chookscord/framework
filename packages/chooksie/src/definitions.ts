/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type {
  BasicOption,
  EmptyObject,
  MessageCommand,
  SlashCommand,
  SlashSubcommand,
  Subcommand,
  SubcommandGroup,
  UserCommand,
} from './types/index.js'

export function defineSlashCommand<T = EmptyObject>(command: SlashCommand<T>) {
  return command
}

export function defineSlashSubcommand(command: SlashSubcommand) {
  return command
}

export function defineUserCommand<T = EmptyObject>(command: UserCommand<T>) {
  return command
}

export function defineMessageCommand<T = EmptyObject>(command: MessageCommand<T>) {
  return command
}

export function defineSubcommand<T = EmptyObject>(option: Subcommand<T>) {
  return option
}

export function defineSubcommandGroup(option: SubcommandGroup) {
  return option
}

export function defineOption(option: BasicOption) {
  return option
}
