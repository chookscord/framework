/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-empty-interface */
import type {
  AutocompleteInteraction,
  Awaitable,
  Client,
  ClientEvents,
  CommandInteraction,
  MessageContextMenuInteraction,
  UserContextMenuInteraction,
} from 'discord.js'
import type {
  AppChannelType,
  AppCommandOptionChoice,
  AppCommandOptionType,
  AppCommandType,
  AppDescription,
  AppName,
} from './internals/discord'

// #region Contexts
/**
 * The base context.
 */
export interface Context {
  client: Client<true>
}

/**
 * Context for event handlers.
 */
export interface EventContext extends Context {
}

/**
 * Context for commands.
 */
export interface CommandContext<T> extends Context {
  interaction: T
}
// #endregion
// #region Utilities
/**
 * Same as {} literal
 */
export type EmptyObject = Record<string, never>

/**
 * @internal Fixes intellisense for execute's `this` context
 */
type Define<Interface extends { execute: (...args: never) => unknown }, T> =
  Omit<Interface, 'execute'> &
  Record<'execute', (...args: Parameters<Interface['execute']>) => Awaitable<void>> &
  ThisType<T>

/**
 * Extract return types of reusable setup functions.
 *
 * @example
 * declare function initProps(): Promise<MyProps>;
 *
 * const ping: SlashCommand<InferSetupType<typeof initProps>> = {
 *   name: 'ping',
 *   description: 'Pong!',
 *   setup: initProps,
 *   async execute(ctx) {
 *     this; // MyProps
 *   },
 * };
 */
export type InferSetupType<Setup> = Setup extends () => Awaitable<infer U> ? U : never
// #endregion
// #region Events
/**
 * An event handler.
 */
export interface Event<Name extends keyof ClientEvents, T = EmptyObject> {
  name: Name
  once?: boolean
  setup?: () => Awaitable<T>
  execute: (this: T, ctx: EventContext, ...args: ClientEvents[Name]) => Awaitable<void>
}

/**
 * **Definition Function**: define an event handler.
 * @see {@link Event}
 */
// @Choooks22: can't use Define<Event...> like normal because for some reason
// TS doesn't want to infer the types
export function defineEvent<T, Name extends keyof ClientEvents>(
  event: Omit<Event<Name, T>, 'execute'> &
  Record<'execute', (...args: Parameters<Event<Name, T>['execute']>) => Awaitable<void>> &
  ThisType<T>,
) {
  return event as unknown as Event<keyof ClientEvents>
}
// #endregion
// #region Commands
export type Command =
| SlashCommand
| SlashSubCommand
| UserCommand
| MessageCommand

/**
 * A basic slash command.
 */
export interface SlashCommand<T = EmptyObject> {
  type?: 'CHAT_INPUT'
  name: AppName
  description: AppDescription
  setup?: () => Awaitable<T>
  execute: (this: T, ctx: CommandContext<CommandInteraction>) => Awaitable<void>
  options?: NonCommandOption[]
}

/**
 * **Definition Function**: define a slash command.
 * @see {@link SlashCommand}
 */
export function defineSlashCommand<T>(command: Define<SlashCommand<T>, T>) {
  return command as SlashCommand
}

/**
 * A slash command with subcommands.
 */
export interface SlashSubCommand {
  type?: 'CHAT_INPUT'
  name: AppName
  description: AppDescription
  options: (SubCommand[]) | (SubCommandGroup[])
}

/**
 * **Definition Function**: define a slash command with subcommands.
 * @see {@link SlashSubCommand}
 */
export function defineSlashSubCommand(command: SlashSubCommand) {
  return command
}

/**
 * A command available in message context menus.
 */
export interface UserCommand<T = EmptyObject> {
  type?: 'USER'
  name: AppName
  setup?: () => Awaitable<T>
  execute: (this: T, ctx: CommandContext<UserContextMenuInteraction>) => Awaitable<void>
}

/**
 * **Definition Function**: define a slash subcommand.
 * @see {@link UserCommand}
 */
export function defineUserCommand<T>(command: Define<UserCommand<T>, T>) {
  return command as UserCommand
}

/**
 * Basic command for message context menus
 */
export interface MessageCommand<T = EmptyObject> {
  type?: 'MESSAGE'
  name: AppName
  setup?: () => Awaitable<T>
  execute: (this: T, ctx: CommandContext<MessageContextMenuInteraction>) => Awaitable<void>
}

/**
 * **Definition Function**: define a message context menu command.
 * @see {@link MessageCommand}
 */
export function defineMessageCommand<T>(command: Define<MessageCommand<T>, T>) {
  return command as MessageCommand
}
// #endregion
// #region Subcommands
export type CommandOption = SubCommand | SubCommandGroup

/**
 * A basic subcommand.
 */
export interface SubCommand<T = EmptyObject> {
  type: 'SUB_COMMAND'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
  setup?: () => Awaitable<T>
  execute: (this: T, ctx: CommandContext<CommandInteraction>) => Awaitable<void>
  options?: NonCommandOption[]
}

/**
 * **Definition Function**: define a subcommand.
 * @see {@link SubCommand}
 */
export function defineSubCommand<T>(command: Define<SubCommand<T>, T>) {
  return command as SubCommand
}

/**
 * A container for nesting subcommands.
 */
export interface SubCommandGroup {
  type: 'SUB_COMMAND_GROUP'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
  options: SubCommand<unknown>[]
}

/**
 * **Definition Function**: define a subcommand group.
 * @see {@link SubCommandGroup}
 */
export function defineSubCommandGroup(command: SubCommandGroup) {
  return command
}
// #endregion
// #region Options
export type Option = CommandOption | NonCommandOption

export type NonCommandOption =
| ChannelOption
| NumberOption
| StringOption
| BoolOption
| UserOption
| RoleOption
| MentionableOption

/**
 * An option where only channels and categories are allowed.
 */
export interface ChannelOption {
  type: 'CHANNEL'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
  channelTypes?: ChannelType[]
}

/**
 * An option where only numbers are allowed.
 */
export interface NumberOption<T = EmptyObject> {
  type: 'INTEGER' | 'NUMBER'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
  choices?: Choice[]
  minValue?: number
  maxValue?: number
  setup?: () => Awaitable<T>
  autocomplete?: (this: T, ctx: CommandContext<AutocompleteInteraction>) => Awaitable<void>
}

/**
 * An option where only text are allowed.
 */
export interface StringOption<T = EmptyObject> {
  type: 'STRING'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
  choices?: Choice[]
  setup?: () => Awaitable<T>
  autocomplete?: (this: T, ctx: CommandContext<AutocompleteInteraction>) => Awaitable<void>
}

/**
 * An option where the only valid answer is true or false.
 */
export interface BoolOption {
  type: 'BOOLEAN'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
}

/**
 * An option where the only users are allowed.
 */
export interface UserOption {
  type: 'USER'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
}

/**
 * An option where the only roles are allowed.
 */
export interface RoleOption {
  type: 'OPTION'
  name: AppName
  description: AppDescription
  required?: boolean
}

/**
 * An option where only users and roles are allowed.
 */
export interface MentionableOption {
  type: 'MENTIONABLE'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
}

/**
 * **Definition Function**: define any non-command option
 * @see {@link NonCommandOption}
 */
export function defineOption(option: NonCommandOption) {
  return option
}
// #endregion
// #region Aliases
export type CommandType = keyof typeof AppCommandType
export type OptionType = keyof typeof AppCommandOptionType
export type ChannelType = keyof typeof AppChannelType

export type Choice = AppCommandOptionChoice
// #endregion
