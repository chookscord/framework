import type {
  ChatInputCommandInteraction,
} from 'discord.js'
import type {
  BaseOption,
  ChannelTypeResolvable, EmptyObject,
} from './base.js'
import type { InteractionContext } from './contexts.js'
import type {
  WithAutocomplete,
  WithExecute, WithOptions,
} from './shared.js'

export interface Subcommand<T = EmptyObject> extends
  BaseOption<'Subcommand'>,
  WithExecute<InteractionContext<ChatInputCommandInteraction>, T>,
  Partial<WithOptions<BasicOption>> {
}

export interface SubcommandGroup extends
  BaseOption<'SubcommandGroup'>,
  WithOptions<Subcommand<any>> {
}

export interface StringOption<T = EmptyObject> extends
  BaseOption<'String'>,
  WithAutocomplete<string, T> {
  minLength?: number
  maxLength?: number
}

export interface NumberOption<T = EmptyObject> extends
  BaseOption<'Number' | 'Integer'>,
  WithAutocomplete<number, T> {
  minValue?: number
  maxValue?: number
}

export interface ChannelOption extends BaseOption<'Channel'> {
  channelTypes?: ChannelTypeResolvable[]
}

export interface BoolOption extends BaseOption<'Boolean'> {
}

export interface UserOption extends BaseOption<'User'> {
}

export interface RoleOption extends BaseOption<'Role'> {
}

export interface MentionableOption extends BaseOption<'Mentionable'> {
}

export interface AttachmentOption extends BaseOption<'Attachment'> {
}

export type AutocompleteOption =
| StringOption
| NumberOption

export type BasicOption =
| AutocompleteOption
| BoolOption
| UserOption
| ChannelOption
| RoleOption
| MentionableOption
| AttachmentOption

export type SubcommandOption =
| Subcommand<any>
| SubcommandGroup

export type Option =
| BasicOption
| SubcommandOption
