import { defineMessageCommand } from 'chooksie'

export default defineMessageCommand({
  name: 'First Word',
  type: 'MESSAGE', // You can "type" leave as is, or remove it entirely.
  async execute(ctx) {
    const message = ctx.interaction.targetMessage
    const firstWord = message.content.split(' ')[0]
    await ctx.interaction.reply(`The first word was: "${firstWord}"`)
  },
})
