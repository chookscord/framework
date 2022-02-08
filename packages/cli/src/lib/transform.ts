import type { Command, Option } from 'chooksie'
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

function transformCommand(command: Command): AppCommand {
  const cmd = <AppCommand>{
    name: command.name,
  }

  if ('type' in command) {
    cmd.type = AppCommandType[command.type!]
  }

  if ('description' in command) {
    cmd.description = command.description
  }

  if ('options' in command) {
    cmd.options = command.options!.map(transformOption)
  }

  if ('defaultPermission' in command) {
    cmd.default_permission = command.defaultPermission
  }

  return cmd
}

export { transformCommand, transformOption }
