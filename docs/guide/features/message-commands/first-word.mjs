import { defineMessageCommand } from 'chooksie'

export default defineMessageCommand({
  name: 'First Word',
  async execute(ctx) {
    const message = ctx.interaction.targetMessage
    const firstWord = message.content.split(' ')[0]
    await ctx.interaction.reply(`The first word is '${firstWord}'!`)
  },
})
