import { defineButtonHandler } from 'chooksie'

export default defineButtonHandler({
  customId: 'pong',
  async execute(ctx) {
    await ctx.interaction.reply('Pong!')
  },
})
