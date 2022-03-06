import { defineSlashCommand } from 'chooksie'

export default defineSlashCommand({
  name: 'echo',
  description: 'Echoes what you just said.',
  async execute(ctx) {
    const message = ctx.interaction.options.getString('message', true)
    await ctx.interaction.reply(message)
  },
  options: [
    {
      name: 'message',
      description: 'The message to repeat.',
      type: 'STRING',
      required: true,
    },
  ],
})
