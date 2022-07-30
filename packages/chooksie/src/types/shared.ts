import type {
  AutocompleteInteraction,
  Awaitable,
  LocalizationMap,
  PermissionResolvable,
} from 'discord.js'
import type {
  BaseContext,
  Choice,
  ChoiceType,
  EmptyObject,
} from './base.js'
import type { InteractionContext } from './contexts.js'

export interface WithName {
  name: string
  nameLocalizations?: LocalizationMap
}

export interface WithDescription {
  description: string
  descriptionLocalizations?: LocalizationMap
}

export interface WithOptions<Option> {
  options: Option[]
}

export interface WithPermissions {
  defaultMemberPermissions?: PermissionResolvable
  dmPermission?: boolean
}

export interface WithRequired {
  required?: boolean
}

export interface WithExecute<
  Ctx extends BaseContext,
  Deps = EmptyObject,
> {
  setup?(): Awaitable<Deps>
  execute(this: Deps, ctx: Ctx): Awaitable<void>
}

export interface WithAutocomplete<
  Type extends ChoiceType = ChoiceType,
  Deps = EmptyObject,
> {
  choices?: Choice<Type>[]
  setup?(): Awaitable<Deps>
  autocomplete(this: Deps, ctx: InteractionContext<AutocompleteInteraction>): Awaitable<void>
}
