// subcommands/setup.js
const { defineOption, defineSlashSubcommand, defineSubcommand } = require('chooksie')

function strings() {
  return require('../utils/string')
}

const stringOption = defineOption({
  name: 'text',
  description: 'The text to transform.',
  type: 'STRING',
  required: true,
})

module.exports = defineSlashSubcommand({
  name: 'string',
  description: 'Change a string\'s case.',
  options: [
    defineSubcommand({
      name: 'upper',
      description: 'Transform a text to be all uppercase.',
      type: 'SUB_COMMAND',
      setup: strings,
      async execute(ctx) {
        const targetText = ctx.interaction.options.getString('text', true)
        await ctx.interaction.reply(this.upper(targetText))
      },
      options: [stringOption],
    }),
    defineSubcommand({
      name: 'lower',
      description: 'Transform a text to be all lowercase.',
      type: 'SUB_COMMAND',
      setup: strings,
      async execute(ctx) {
        const targetText = ctx.interaction.options.getString('text', true)
        await ctx.interaction.reply(this.lower(targetText))
      },
      options: [stringOption],
    }),
  ],
})
