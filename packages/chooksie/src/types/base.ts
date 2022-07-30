import type {
  ApplicationCommandOptionType,
  ChannelType,
  Client,
} from 'discord.js'
import type { Logger } from 'pino'
import type {
  WithDescription,
  WithName,
  WithPermissions,
  WithRequired,
} from './shared.js'

export type AnyObject = Record<string, any>
export type EmptyObject = Record<string, never>
export type UnknownObject = Record<string, unknown>

export type OptionType = keyof typeof ApplicationCommandOptionType

export type ChoiceType = string | number
export type ChannelTypeResolvable = ChannelType | keyof typeof ChannelType

export interface Choice<Type extends ChoiceType = ChoiceType> extends WithName {
  value: Type
}

export interface BaseContext {
  client: Client<true>
  logger: Logger
}

export interface BaseCommand extends
  WithName,
  WithPermissions {
}

export interface BaseOption<Type extends OptionType = OptionType> extends
  WithName,
  WithDescription,
  WithRequired {
  type: Type
}
