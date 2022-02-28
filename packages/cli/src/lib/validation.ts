/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { BoolOption, ChannelOption, ChannelType, Choice, Command, Event, MentionableOption, MessageCommand, NumberOption, RoleOption, SlashCommand, SlashSubcommand, StringOption, Subcommand, SubcommandGroup, UserCommand, UserOption } from 'chooksie'
import type { ClientEvents } from 'discord.js'
import Joi from 'joi'
import { AppChannelType } from '../internals'

const appName = Joi.string()
  .lowercase()
  .pattern(/^[\w-]{1,32}$/u)
  .required()

const appDescription = Joi.string()
  .min(1)
  .max(100)
  .required()

const contextName = Joi.string()
  .pattern(/^[ \w-]{1,32}$/u)
  .required()

const channelTypes = <ChannelType[]>Object.keys(AppChannelType)

const channelOption = Joi.object<ChannelOption>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('CHANNEL')
    .required(),
  required: Joi.bool(),
  channelTypes: Joi.array()
    .items(Joi.string()
      .equal(...channelTypes)
      .required()),
})

const stringChoice = Joi.object<Choice>({
  name: appDescription,
  value: Joi.string()
    .max(100)
    .required(),
})

const numberChoice = Joi.object<Choice>({
  name: appDescription,
  value: Joi.number()
    .required(),
})

const numberOption = Joi.object<NumberOption>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('NUMBER', 'INTEGER')
    .required(),
  choices: Joi.array()
    .items(numberChoice)
    .max(25),
  required: Joi.bool(),
  minValue: Joi.number(),
  maxValue: Joi.number(),
  setup: Joi.func(),
  autocomplete: Joi.func(),
}).oxor('choices', 'autocomplete')
  .with('setup', 'autocomplete')

const stringOption = Joi.object<StringOption>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('STRING')
    .required(),
  choices: Joi.array()
    .items(stringChoice)
    .max(25),
  required: Joi.bool(),
  setup: Joi.func(),
  autocomplete: Joi.func(),
}).oxor('choices', 'autocomplete')
  .with('setup', 'autocomplete')

const boolOption = Joi.object<BoolOption>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('BOOLEAN')
    .required(),
  required: Joi.bool(),
})

const userOption = Joi.object<UserOption>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('USER')
    .required(),
  required: Joi.bool(),
})

const roleOption = Joi.object<RoleOption>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('ROLE')
    .required(),
  required: Joi.bool(),
})

const mentionableOption = Joi.object<MentionableOption>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('MENTIONABLE')
    .required(),
  required: Joi.bool(),
})

const nonCommandOption = [
  channelOption,
  numberOption,
  stringOption,
  boolOption,
  userOption,
  roleOption,
  mentionableOption,
]

const subCommand = Joi.object<Subcommand>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('SUB_COMMAND')
    .required(),
  required: Joi.bool(),
  setup: Joi.func(),
  execute: Joi.func()
    .required(),
  options: Joi.array()
    .items(...nonCommandOption)
    .max(25),
})

const subCommandGroup = Joi.object<SubcommandGroup>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('SUB_COMMAND_GROUP')
    .required(),
  required: Joi.bool(),
  options: Joi.array()
    .items(subCommand)
    .max(25)
    .required(),
})

const slashCommand = Joi.object<SlashCommand>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('CHAT_INPUT'),
  setup: Joi.func(),
  execute: Joi.func()
    .required(),
  options: Joi.array()
    .items(...nonCommandOption)
    .max(25),
})

export function validateSlashCommand(command: Partial<Command>): Promise<SlashCommand> {
  return slashCommand.validateAsync(command)
}

const slashSubcommand = Joi.object<SlashSubcommand>({
  name: appName,
  description: appDescription,
  type: Joi.string()
    .equal('CHAT_INPUT'),
  options: Joi.array()
    .items(
      Joi.alternatives()
        .conditional('.type', {
          is: 'SUB_COMMAND_GROUP',
          then: subCommandGroup,
          otherwise: subCommand,
        })
        .required(),
    )
    .min(1)
    .max(25)
    .required(),
})

export function validateSlashSubcommand(command: Partial<Command>): Promise<SlashSubcommand> {
  return slashSubcommand.validateAsync(command)
}

const userCommand = Joi.object<UserCommand>({
  name: contextName,
  type: Joi.string()
    .equal('USER'),
  setup: Joi.func(),
  execute: Joi.func()
    .required(),
})

export function validateUserCommand(command: Partial<Command>): Promise<UserCommand> {
  return userCommand.validateAsync(command)
}

const messageCommand = Joi.object<MessageCommand>({
  name: contextName,
  type: Joi.string()
    .equal('MESSAGE'),
  setup: Joi.func(),
  execute: Joi.func()
    .required(),
})

export function validateMessageCommand(command: Partial<Command>): Promise<MessageCommand> {
  return messageCommand.validateAsync(command)
}

const eventModule = Joi.object<Event<keyof ClientEvents>>({
  name: Joi.string()
    .required(),
  once: Joi.bool(),
  setup: Joi.func(),
  execute: Joi.func()
    .required(),
})

export function validateEvent<T extends keyof ClientEvents>(event: Partial<Event<T>>): Promise<Event<T>> {
  return eventModule.validateAsync(event)
}
