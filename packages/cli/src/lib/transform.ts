import type { CommandModule, Option } from 'chooksie'
import type { AppCommand, AppCommandOption } from 'chooksie/internals'
import { AppChannelType, AppCommandOptionType, AppCommandType } from '../internals'

function transformOption(option: Option): AppCommandOption {
  const opt = <AppCommandOption>{
    name: option.name,
    description: option.description,
    type: AppCommandOptionType[option.type],
  }

  if ('options' in option) {
    opt.options = option.options!.map(transformOption)
  }

  if ('choices' in option) {
    opt.choices = option.choices
  }

  if ('autocomplete' in option) {
    opt.autocomplete = typeof option.autocomplete === 'function'
  }

  if ('required' in option) {
    opt.required = option.required
  }

  if ('minValue' in option || 'maxValue' in option) {
    opt.max_value = option.maxValue
    opt.min_value = option.minValue
  }

  if ('channelTypes' in option) {
    opt.channel_types = option.channelTypes!.map(type => AppChannelType[type])
  }

  return opt
}

function transformModule(mod: CommandModule): AppCommand {
  const cmd = <AppCommand>{
    name: mod.name,
  }

  if ('type' in mod) {
    cmd.type = AppCommandType[mod.type!]
  }

  if ('description' in mod) {
    cmd.description = mod.description
  }

  if ('options' in mod) {
    cmd.options = mod.options!.map(transformOption)
  }

  if ('defaultPermission' in mod) {
    cmd.default_permission = mod.defaultPermission
  }

  return cmd
}

export { transformModule, transformOption }
