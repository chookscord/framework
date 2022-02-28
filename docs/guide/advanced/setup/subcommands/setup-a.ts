// subcommands/setup.ts
import { defineOption, defineSlashSubcommand, defineSubcommand } from 'chooksie'

function strings() {
  return import('../utils/string')
}

const stringOption = defineOption({
  name: 'text',
  description: 'The text to transform.',
  type: 'STRING',
  required: true,
})

export default defineSlashSubcommand({
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
  ],
})
