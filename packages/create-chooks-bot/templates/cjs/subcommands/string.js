const { defineOption, defineSlashSubcommand, defineSubcommand, defineSubcommandGroup } = require('chooksie')

function strings() {
  const lower = text => text.toLowerCase()
  const upper = text => text.toUpperCase()
  return { upper, lower }
}

const stringOption = defineOption({
  name: 'text',
  description: 'The text to transform.',
  type: 'STRING',
  required: true,
})

module.exports = defineSlashSubcommand({
  name: 'string',
  description: 'Perform string manipulations.',
  options: [
    defineSubcommandGroup({
      name: 'case',
      description: 'Change a text\'s case.',
      type: 'SUB_COMMAND_GROUP',
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
    }),
  ],
})
