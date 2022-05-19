/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any */
import type {
  AutocompleteInteraction,
  Awaitable,
  Client,
  ClientEvents,
  ClientOptions,
  CommandInteraction,
  IntentsString,
  Interaction,
  MessageContextMenuInteraction,
  ModalSubmitInteraction,
  UserContextMenuInteraction,
} from 'discord.js'
import type { Logger as PinoLogger } from 'pino'
import type {
  AppChannelType,
  AppCommandOptionType,
  AppCommandType,
  AppDescription,
  AppName,
} from './internals/discord'

// #region Config
/**
 * Config file schema.
 */
export interface ChooksConfig {
  token: string
  intents: IntentsString[]
  devServer?: string
  client?: {
    options?: Omit<ClientOptions, 'intents'>
  }
}

/**
 * **Definition Function**: define your bot's config.
 *
 * ## THIS FILE CONTAINS SENSITIVE CREDENTIALS!
 * When using a version control system like `git`, this file should be kept track of,
 * but should not contain your credentials directly.
 *
 * For this reason, we automatically load `.env` files, which is where you should
 * put your token and **SHOULD NOT** be tracked.
 *
 * **Sample `.env` file:**
 *
 * ```sh
 * BOT_TOKEN=your-bot-token-here
 * DEV_SERVER=your-dev-server-id
 * ```
 *
 * ## See Also
 * - {@link ChooksConfig Config} Definition
 * - [Configuration](https://guide.chooks.app/configuration/) Web Docs
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineConfig}
 * - Using variables from `.env` files
 *
 * @example
 * <caption>### Config</caption>
 * import { defineConfig } from 'chooksie'
 *
 * // .env files are automatically loaded
 * export default defineConfig({
 *   token: process.env.BOT_TOKEN,
 *   devServer: process.env.DEV_SERVER,
 *   intents: [
 *     'GUILDS',
 *     'DIRECT_MESSAGES',
 *   ],
 * })
 */
export function defineConfig(config: ChooksConfig) {
  return config
}
// #endregion

// #region Contexts
export type Logger = Pick<PinoLogger, 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'child'>

/**
 * The base context.
 */
export interface Context {
  id: string
  client: Client<true>
  logger: Logger
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

export type Execute<InteractionType, ThisArg> = (this: ThisArg, ctx: CommandContext<InteractionType>) => Awaitable<void>
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

type DefineEvent<Name extends keyof ClientEvents, T> =
  Omit<Event<Name, T>, 'execute'> &
  Record<'execute', (ctx: EventContext, ...args: ClientEvents[Name]) => Awaitable<void>> &
  ThisType<T>

type DefineOption<T> =
  Exclude<NonCommandOption, StringOption | NumberOption> |
  Omit<StringOption<T> | NumberOption<T>, 'autocomplete'> &
  Partial<Record<'autocomplete', (ctx: CommandContext<AutocompleteInteraction>) => Awaitable<void>>> &
  ThisType<T>

/**
 * Extract return types of reusable setup functions.
 *
 * @example
 * declare function initProps(): Promise<MyProps>
 *
 * const ping: SlashCommand<InferSetupType<typeof initProps>> = {
 *   name: 'ping',
 *   description: 'Pong!',
 *   setup: initProps,
 *   async execute(ctx) {
 *     this // MyProps
 *   },
 * }
 */
export type InferSetupType<Setup> = Setup extends () => Awaitable<infer U> ? U : never

export type GenericHandler = (ctx: CommandContext<Interaction>) => Awaitable<void>
export interface Command {
  updatedAt?: number
  execute: GenericHandler
  logger: Logger
}

export type CommandStore = Map<string, Command>
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
 *
 * ## See Also
 * - {@link Event Event} Definition
 * - [Event Listeners](https://guide.chooks.app/features/event-listeners/) Web Docs
 * - [Setup API](https://guide.chooks.app/advanced/setup/) Web Guide
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineEvent}
 *
 * @example
 * <caption>### Events</caption>
 * import { defineEvent } from 'chooksie'
 *
 * export default defineEvent({
 *   name: 'ready',
 *   once: true,
 *   execute(ctx) {
 *     ctx.logger.info(`Logged in as ${ctx.client.user.username}!`)
 *   },
 * })
 *
 * @example
 * <caption>### Events with Parameters</caption>
 * import { defineEvent } from 'chooksie'
 *
 * export default defineEvent({
 *   name: 'interactionCreate',
 *   execute(ctx, interaction) {
 *     ctx.logger.info(`Received an interaction at ${interaction.createdAt}`)
 *   },
 * })
 */
export function defineEvent<T, Name extends keyof ClientEvents>(event: DefineEvent<Name, T>) {
  return event as unknown as Event<keyof ClientEvents>
}
// #endregion
// #region Commands
export type CommandModule =
| SlashCommand<any>
| SlashSubcommand
| UserCommand<any>
| MessageCommand<any>

/**
 * A basic slash command.
 */
export interface SlashCommand<T = EmptyObject> {
  type?: 'CHAT_INPUT'
  name: AppName
  description: AppDescription
  setup?: () => Awaitable<T>
  execute: Execute<CommandInteraction, T>
  options?: NonCommandOption[]
  /** @default false */
  defaultPermission?: boolean
}

/**
 * **Definition Function**: define a slash command.
 *
 * ## See Also
 * - {@link SlashCommand Slash Command} Definition
 * - [Slash Commands](https://guide.chooks.app/features/slash-commands/) Web Docs
 * - {@link defineSlashSubcommand Slash Subcommands}
 * - [Setup API](https://guide.chooks.app/advanced/setup/) Web Guide
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineSlashCommand}
 *
 * @example
 * <caption>### Slash Commands</caption>
 * import { defineSlashCommand } from 'chooksie'
 *
 * export default defineSlashCommand({
 *   name: 'ping',
 *   description: 'Pong!',
 *   async execute(ctx) {
 *     await ctx.interaction.reply('Pong!')
 *   },
 * })
 */
export function defineSlashCommand<T>(command: Define<SlashCommand<T>, T>) {
  return command as SlashCommand
}

/**
 * A slash command with subcommands.
 */
export interface SlashSubcommand {
  type?: 'CHAT_INPUT'
  name: AppName
  description: AppDescription
  options: (Subcommand<any>[]) | (SubcommandGroup[])
  /** @default false */
  defaultPermission?: boolean
}

/**
 * **Definition Function**: define a slash command with subcommands.
 *
 * ## See Also
 * - {@link SlashSubcommand Slash Subcommand} Definition
 * - [Slash Subcommands](https://guide.chooks.app/features/slash-subcommands/) Web Docs
 * - {@link Subcommand Subcommand} Definition
 * - {@link SubcommandGroup Subcommand Group} Definition
 * - {@link SlashCommand Slash Commands}
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Reusing `setup` functions
 * - Reusing options using {@linkcode defineOption}
 * - Using {@linkcode defineSlashSubcommand}
 * - Using {@linkcode defineSubcommand}
 * - Using {@linkcode defineSubcommandGroup}
 *
 * @example
 * <caption>### Subcommands</caption>
 * import { defineOption, defineSlashSubcommand, defineSubcommand } from 'chooksie'
 *
 * const numbers = [
 *   defineOption({
 *     name: 'x',
 *     description: 'First number.',
 *     type: 'NUMBER',
 *     required: true,
 *   }),
 *   defineOption({
 *     name: 'y',
 *     description: 'Second number.',
 *     type: 'NUMBER',
 *     required: true,
 *   }),
 * ]
 *
 * export default defineSlashSubcommand({
 *   name: 'math',
 *   description: 'Do math stuff.',
 *   options: [
 *     defineSubcommand({
 *       name: 'add',
 *       description: 'Add two numbers',
 *       type: 'SUB_COMMAND',
 *       async execute(ctx) {
 *         const x = ctx.interaction.options.getNumber('x', true)
 *         const y = ctx.interaction.options.getNumber('y', true)
 *         await ctx.interaction.reply(`${x} + ${y} = ${x + y}`)
 *       },
 *       options: numbers,
 *     }),
 *     defineSubcommand({
 *       name: 'subtract',
 *       description: 'Subtract two numbers',
 *       type: 'SUB_COMMAND',
 *       async execute(ctx) {
 *         const x = ctx.interaction.options.getNumber('x', true)
 *         const y = ctx.interaction.options.getNumber('y', true)
 *         await ctx.interaction.reply(`${x} - ${y} = ${x - y}`)
 *       },
 *       options: numbers,
 *     }),
 *   ],
 * })
 *
 * @example
 * <caption>### Subcommand Groups</caption>
 * import { defineOption, defineSlashSubcommand, defineSubcommand, defineSubcommandGroup } from 'chooksie'
 *
 * function strings() {
 *   const lower = text => text.toLowerCase()
 *   const upper = text => text.toUpperCase()
 *   return { upper, lower }
 * }
 *
 * const stringOption = defineOption({
 *   name: 'text',
 *   description: 'The text to transform.',
 *   type: 'STRING',
 *   required: true,
 * })
 *
 * const upper = defineSubcommand({
 *   name: 'upper',
 *   description: 'Transform a text to be all uppercase.',
 *   type: 'SUB_COMMAND',
 *   setup: strings,
 *   async execute(ctx) {
 *     const targetText = ctx.interaction.options.getString('text', true)
 *     await ctx.interaction.reply(this.upper(targetText))
 *   },
 *   options: [stringOption],
 * })
 *
 * const lower = defineSubcommand({
 *   name: 'lower',
 *   description: 'Transform a text to be all lowercase.',
 *   type: 'SUB_COMMAND',
 *   setup: strings,
 *   async execute(ctx) {
 *     const targetText = ctx.interaction.options.getString('text', true)
 *     await ctx.interaction.reply(this.lower(targetText))
 *   },
 *   options: [stringOption],
 * })
 *
 * export default defineSlashSubcommand({
 *   name: 'string',
 *   description: 'Perform string manipulations.',
 *   options: [
 *     defineSubcommandGroup({
 *       name: 'case',
 *       description: "Change a text's case.",
 *       type: 'SUB_COMMAND_GROUP',
 *       options: [
 *         upper,
 *         lower,
 *       ],
 *     }),
 *   ],
 * })
 */
export function defineSlashSubcommand(command: SlashSubcommand) {
  return command
}

/**
 * A command available in message context menus.
 */
export interface UserCommand<T = EmptyObject> {
  type?: 'USER'
  name: AppName
  setup?: () => Awaitable<T>
  execute: Execute<UserContextMenuInteraction, T>
  /** @default false */
  defaultPermission?: boolean
}

/**
 * **Definition Function**: define a user command.
 *
 * ## See Also
 * - {@link UserCommand User Command} Definition
 * - [User Commands](https://guide.chooks.app/features/slash-commands/) Web Docs
 * - {@link defineMessageCommand Message Commands}
 * - [Setup API](https://guide.chooks.app/advanced/setup/) Web Guide
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineUserCommand}
 *
 * @example
 * <caption>### User Commands</caption>
 * import { defineUserCommand } from 'chooksie'
 *
 * export default defineUserCommand({
 *   name: 'High Five',
 *   async execute(ctx) {
 *     const user = ctx.interaction.user
 *     const target = ctx.interaction.targetUser
 *     await ctx.interaction.reply(`${user} High Fived ${target}!`)
 *   },
 * })
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
  execute: Execute<MessageContextMenuInteraction, T>
  /** @default false */
  defaultPermission?: boolean
}

/**
 * **Definition Function**: define a message context menu command.
 *
 * ## See Also
 * - {@link MessageCommand Message Command} Definition
 * - [Message Commands](https://guide.chooks.app/features/message-commands/) Web Docs
 * - {@link defineUserCommand User Commands}
 * - [Setup API](https://guide.chooks.app/advanced/setup/) Web Guide
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineMessageCommand}
 *
 * @example
 * <caption>### Message Commands</caption>
 * import { defineMessageCommand } from 'chooksie'
 *
 * export default defineMessageCommand({
 *   name: 'First Word',
 *   async execute(ctx) {
 *     const msg = ctx.interaction.targetMessage
 *     const firstWord = msg.content.split(/ +/g)[0]
 *     await ctx.interaction.reply(`The first word is "${firstWord}"!`)
 *   },
 * })
 */
export function defineMessageCommand<T>(command: Define<MessageCommand<T>, T>) {
  return command as MessageCommand
}
// #endregion
// #region Subcommands
export type CommandOption = Subcommand<any> | SubcommandGroup

/**
 * A basic subcommand.
 */
export interface Subcommand<T = EmptyObject> {
  type: 'SUB_COMMAND'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
  setup?: () => Awaitable<T>
  execute: Execute<CommandInteraction, T>
  options?: NonCommandOption[]
}

/**
 * **Definition Function**: define a subcommand.
 *
 * ## See Also
 * - {@link Subcommand Subcommand} Definition
 * - [Subcommands](https://guide.chooks.app/features/slash-subcommands/#subcommands-inlined) Web Docs
 * - {@link defineSlashSubcommand Slash Subcommands}
 * - {@link defineSubcommandGroup Subcommand Groups}
 * - [Setup API](https://guide.chooks.app/advanced/setup/) Web Guide
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineSubcommand}
 * - Using `setup` functions
 *
 * @example
 * <caption>### Subcommands</caption>
 * import { defineMessageCommand, defineOption, defineSubcommand } from 'chooksie'
 *
 * const lower = defineSubcommand({
 *   name: 'lower',
 *   description: 'Transform a text to be all lowercase.',
 *   type: 'SUB_COMMAND',
 *   setup() {
 *     const lower = text => text.toLowerCase()
 *     return { lower }
 *   },
 *   async execute(ctx) {
 *     const targetText = ctx.interaction.options.getString('text', true)
 *     await ctx.interaction.reply(this.lower(targetText))
 *   },
 *   options: [
 *     defineOption({
 *       name: 'text',
 *       description: 'The text to transform.',
 *       type: 'STRING',
 *       required: true,
 *     }),
 *   ],
 * })
 */
export function defineSubcommand<T>(command: Define<Subcommand<T>, T>) {
  return command as Subcommand
}

/**
 * A container for nesting subcommands.
 */
export interface SubcommandGroup {
  type: 'SUB_COMMAND_GROUP'
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
  options: Subcommand<any>[]
}

/**
 * **Definition Function**: define a subcommand group.
 *
 * ## See Also
 * - {@link SubcommandGroup Subcommand Group} Definition
 * - [Subcommand Groups](https://guide.chooks.app/features/slash-subcommands/#subcommand-groups-inlined) Web Docs
 * - {@link defineSlashSubcommand Slash Subcommands}
 * - {@link defineSubcommand Subcommands}
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineSubcommandGroup}
 * - Using {@linkcode defineSubcommand}
 *
 * @example
 * <caption>### Subcommand Groups</caption>
 * import { defineSubcommand, defineSubcommandGroup } from 'chooksie'
 *
 * const stringCases = defineSubcommandGroup({
 *   name: 'case',
 *   description: "Change a text's case.",
 *   type: 'SUB_COMMAND_GROUP',
 *   options: [
 *     defineSubcommand({
 *       name: 'lower',
 *       description: 'Transform a text to be all lowercase.',
 *       type: 'SUB_COMMAND',
 *       async execute(ctx) {
 *         const targetText = ctx.interaction.options.getString('text')
 *         await ctx.interaction.reply(targetText.toLowerCase())
 *       },
 *       options: [
 *         {
 *           name: 'text',
 *           description: 'The text to transform.',
 *           type: 'STRING',
 *           required: true,
 *         },
 *       ],
 *     }),
 *   ],
 * })
 */
export function defineSubcommandGroup(command: SubcommandGroup) {
  return command
}
// #endregion
// #region Modals
/**
 * A handler for submitted modals.
 */
export interface ModalHandler<T = EmptyObject> {
  customId: string
  setup?: () => Awaitable<T>
  execute: Execute<ModalSubmitInteraction, T>
}

/**
 * **Definition Function**: define a modal submit handler.
 *
 * ## See Also
 * - {@link ModalHandler Modal Handler} Defintion
 * - [Modals](https://guide.chooks.app/features/modals/) Web Docs
 * - [Setup API](https://guide.chooks.app/advanced/setup/) Web Guide
 * - [Building and responding with modals](https://discordjs.guide/interactions/modals.html#building-and-responding-with-modals) Web Guide
 *
 * @example
 * <caption>### Modals</caption>
 * import { defineModalHandler } from 'chooksie'
 *
 * export default defineModalHandler({
 *   customId: 'tag-image',
 *   setup: () => import('../db'),
 *   async execute(ctx) {
 *     const messageId = ctx.interaction.message.id
 *     const tags = ctx.interaction.fields.getTextInputValue('tags')
 *
 *     await ctx.interaction.deferReply({
 *       ephemeral: true,
 *     })
 *
 *     await this.db.tags.save({
 *       id: messageId,
 *       tags: tags.split(','),
 *     })
 *
 *     await ctx.interaction.editReply('Image tagged!')
 *   },
 * })
 */
export function defineModalHandler<T>(handler: Define<ModalHandler<T>, T>) {
  return handler
}
// #endregion
// #region Options
export type Option = CommandOption | NonCommandOption

export type OptionWithAutocomplete = NumberOption | StringOption
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
  choices?: Choice<number>[]
  minValue?: number
  maxValue?: number
  setup?: () => Awaitable<T>
  autocomplete?: Execute<AutocompleteInteraction, T>
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
  choices?: Choice<string>[]
  setup?: () => Awaitable<T>
  autocomplete?: Execute<AutocompleteInteraction, T>
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
  type: 'ROLE'
  name: AppName
  description: AppDescription
  /** @default false */
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
 *
 * ## See Also
 * - [`AutocompleteInteraction`](https://discord.js.org/#/docs/discord.js/stable/class/AutocompleteInteraction) documentation
 * - {@link ChannelOption Channel Option} Definition
 * - {@link NumberOption Number Option} Definition
 * - {@link StringOption String Option} Definition
 * - {@link BoolOption  Bool Option} Definition
 * - {@link UserOption User Option} Definition
 * - {@link RoleOption Role Option} Definition
 * - {@link MentionableOption Mentionable Option} Definition
 * - {@link defineChoice Choices}
 * - [Setup API](https://guide.chooks.app/advanced/setup/) Web Guide
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineOption}
 * - Inlining options with {@linkcode defineSubcommand}
 * - Using `autocomplete` handlers
 * - Using `setup` functions
 *
 * @example
 * <caption>### Options with Autocomplete</caption>
 * import { defineOption } from 'chooksie'
 *
 * const username = defineOption({
 *   name: 'username',
 *   description: "The account's username.",
 *   type: 'STRING',
 *   async setup() {
 *     const db = await import('./some-db')
 *     return { db }
 *   },
 *   async autocomplete(ctx) {
 *     const input = ctx.interaction.options.getFocused()
 *     const name = await this.db.users.find({ name: input })
 *     await ctx.interaction.respond([
 *       {
 *         name: `Username: ${name}`,
 *         value: name,
 *       },
 *     ])
 *   },
 * })
 *
 * @example
 * <caption>### Inlining Options</caption>
 * import { defineSubcommand } from 'chooksie'
 *
 * const randomNumber = defineSubcommand({
 *   name: 'random',
 *   description: 'Returns a random number.',
 *   type: 'SUB_COMMAND',
 *   async execute(ctx) {
 *     const max = ctx.interaction.options.getNumber('max') ?? 100
 *     const random = Math.floor(Math.random() * max)
 *     await ctx.interaction.reply(`Your random number is: ${random}`)
 *   },
 *   options: [
 *     {
 *       name: 'max',
 *       description: 'Max number. Defaults to 100',
 *       type: 'NUMBER',
 *     },
 *   ],
 * })
 */
export function defineOption<T>(option: DefineOption<T>) {
  return option as NonCommandOption
}

export interface Choice<Type extends string | number = string | number> {
  name: AppName
  value: Type
}

/**
 * **Definition Function**: define an option.
 *
 * ## See Also
 * - {@link OptionWithAutocomplete Options with Choices}
 * - {@link defineOption Options}
 *
 * ## Examples
 *
 * Snippets below includes samples for:
 * - Using {@linkcode defineChoice}
 * - Inlining choices
 *
 * @example
 * <caption>### Choices</caption>
 * import { defineChoice } from 'chooksie'
 *
 * const colors = [
 *   defineChoice({
 *     name: 'Red',
 *     value: 'red',
 *   }),
 *   defineChoice({
 *     name: 'Green',
 *     value: 'green',
 *   }),
 *   defineChoice({
 *     name: 'Blue',
 *     value: 'blue',
 *   }),
 * ]
 *
 * @example
 * <caption>### Inline Choices</caption>
 * import { defineOption } from 'chooksie'
 *
 * const colorOption = defineOption({
 *   name: 'color',
 *   description: 'Pick a color.',
 *   type: 'STRING',
 *   required: true,
 *   choices: [
 *     {
 *       name: 'Red',
 *       value: 'red',
 *     },
 *     {
 *       name: 'Green',
 *       value: 'green',
 *     },
 *     {
 *       name: 'Blue',
 *       value: 'blue',
 *     },
 *   ],
 * })
 */
export function defineChoice<T extends string | number>(choice: Choice<T>) {
  return choice
}

// #endregion
// #region Scripts
/**
 * A script that executes when the file is loaded and reloaded.
 *
 * @example
 * export const chooksOnLoad: OnLoad = (ctx) => {
 *   ctx.logger.info('File loaded!')
 *   return () => {
 *     ctx.logger.info('File reloading...')
 *   }
 * }
 */
export type OnLoad = (ctx: Context) => Awaitable<(() => void) | void>

/**
 * A file that exports special variables that does executes a specific task.
 */
export interface ChooksScript {
  chooksOnLoad?: OnLoad
  [key: string]: unknown
}

/**
 * **Definition Function**: define a function that executes when a file is loaded/reloaded.
 *
 * Use this script when running persistent code like setInterval,
 * starting web servers, connecting to databases, etc.
 *
 * ## See Also
 * - {@link OnLoad On Load Script}
 * - [External Scripts](https://guide.chooks.app/advanced/scripts/) Web Guide
 * - [Database and Servers](https://guide.chooks.app/advanced/database-servers/) Web Guide
 * - {@link ChooksScript Scripts}
 *
 * ## Examples
 * - Running a [`Fastify`](https://www.npmjs.com/package/fastify) server
 *
 * @example
 * import { defineOnLoad } from 'chooksie'
 * import { fastify } from 'fastify'
 *
 * // IMPORTANT: the variable name must match
 * export const chooksOnLoad = defineOnLoad(async ctx => {
 *   const app = fastify({
 *     // Since Fastify actually uses Pino under the hood for logging, we can
 *     // pass "type": "fastify" to enable logging integration with Chooksie!
 *     logger: ctx.logger.child({ type: 'fastify' }),
 *   })
 *
 *   // Create an endpoint that returns how many servers our bot is in
 *   app.get('/guilds', async (req, reply) => {
 *     await reply.send({ count: ctx.client.guilds.cache.size })
 *   })
 *
 *   // Start listening on port 3000.
 *   await app.listen(3000)
 *
 *   // Stop our server when it gets updated.
 *   return async () => {
 *     ctx.logger.info('Stopping server...')
 *     await app.close()
 *   }
 * })
 */
export function defineOnLoad(script: OnLoad) {
  return script
}
// #endregion
// #region Aliases
export type CommandType = keyof typeof AppCommandType
export type OptionType = keyof typeof AppCommandOptionType
export type ChannelType = keyof typeof AppChannelType
// #endregion
