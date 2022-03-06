import { defineOption, defineSlashSubcommand, defineSubcommand, defineSubcommandGroup } from 'chooksie'

function strings() {
  const lower = (text: string) => text.toLowerCase()
  const upper = (text: string) => text.toUpperCase()
  return { upper, lower }
}

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
