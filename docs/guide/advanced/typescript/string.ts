import type { Option, SlashSubcommand, Subcommand, SubcommandGroup } from 'chooksie'

const stringOption: Option = {
  name: 'text',
  description: 'The text to transform.',
  type: 'STRING',
  required: true,
}

const upper: Subcommand = {
  name: 'upper',
  description: 'Transform a text to be all uppercase.',
  type: 'SUB_COMMAND',
  async execute(ctx) {
    const targetText = ctx.interaction.options.getString('text', true)
    await ctx.interaction.reply(targetText.toUpperCase())
  },
  options: [stringOption],
}

const lower: Subcommand = {
  name: 'lower',
  description: 'Transform a text to be all lowercase.',
  type: 'SUB_COMMAND',
  async execute(ctx) {
    const targetText = ctx.interaction.options.getString('text', true)
    await ctx.interaction.reply(targetText.toLowerCase())
  },
  options: [stringOption],
}

const changeCase: SubcommandGroup = {
  name: 'case',
  description: 'Change a string\'s case.',
  type: 'SUB_COMMAND_GROUP',
  options: [
    upper,
    lower,
  ],
}

const stringCommand: SlashSubcommand = {
  name: 'string',
  description: 'Perform string manipulations.',
  options: [changeCase],
}

export default stringCommand
