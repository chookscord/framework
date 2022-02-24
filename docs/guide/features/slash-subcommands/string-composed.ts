import { defineOption, defineSlashSubcommand, defineSubcommand } from 'chooksie'

const stringOption = defineOption({
  name: 'text',
  description: 'The text to transform.',
  type: 'STRING',
  required: true,
})

const upper = defineSubcommand({
  name: 'upper',
  description: 'Transform a text to be all uppercase.',
  type: 'SUB_COMMAND',
  async execute(ctx) {
    const targetText = ctx.interaction.options.getString('text', true)
    await ctx.interaction.reply(targetText.toUpperCase())
  },
  options: [stringOption],
})

const lower = defineSubcommand({
  name: 'lower',
  description: 'Transform a text to be all lowercase.',
  type: 'SUB_COMMAND',
  async execute(ctx) {
    const targetText = ctx.interaction.options.getString('text', true)
    await ctx.interaction.reply(targetText.toLowerCase())
  },
  options: [stringOption],
})

export default defineSlashSubcommand({
  name: 'string',
  description: 'Change a string\'s case.',
  options: [
    upper,
    lower,
  ],
})
