import { defineOption, defineSlashSubcommand, defineSubcommand, defineSubcommandGroup } from 'chooksie'

const stringOption = defineOption({
  name: 'text',
  description: 'The text to transform.',
  type: 'STRING',
  required: true,
})

export default defineSlashSubcommand({
  name: 'string',
  description: 'Perform string manipulations.',
  options: [
    defineSubcommandGroup({
      name: 'case',
      description: 'Change a string\'s case.',
      type: 'SUB_COMMAND_GROUP',
      options: [
        defineSubcommand({
          name: 'upper',
          description: 'Transform a text to be all uppercase.',
          type: 'SUB_COMMAND',
          async execute(ctx) {
            const targetText = ctx.interaction.options.getString('text', true)
            await ctx.interaction.reply(targetText.toUpperCase())
          },
          options: [stringOption],
        }),
        defineSubcommand({
          name: 'lower',
          description: 'Transform a text to be all lowercase.',
          type: 'SUB_COMMAND',
          async execute(ctx) {
            const targetText = ctx.interaction.options.getString('text', true)
            await ctx.interaction.reply(targetText.toLowerCase())
          },
          options: [stringOption],
        }),
      ],
    }),
  ],
})
