/**
 * 1-32 character name
 * CHAT_INPUT must match /^[\w-]{1,32}$/u
 * USER and MESSAGE can be mixed case and with spaces
 */
export type AppName = string

/**
 * 1-100 character description
 */
export type AppDescription = string

export interface AppCommand {
  /** @default AppCommandOptionType.CHAT_INPUT */
  type?: AppCommandType
  name: AppName
  description?: AppDescription
  options?: AppCommandOption[]
  /** @default false */
  default_permission?: boolean
}

export enum AppCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3,
}

export interface AppCommandOption {
  type: AppCommandOptionType
  name: AppName
  description: AppDescription
  /** @default false */
  required?: boolean
  choices?: AppCommandOptionChoice[]
  options?: AppCommandOption[]
  channel_types?: AppChannelType[]
  min_value?: number
  max_value?: number
  autocomplete?: boolean
}

export enum AppCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
}

export enum AppChannelType {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_NEWS = 5,
  GUILD_STORE = 6,
  GUILD_NEWS_THREAD = 10,
  GUILD_PUBLIC_THREAD = 11,
  GUILD_PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
}

export interface AppCommandOptionChoice {
  name: AppName
  value: string | number
}
