import { defineMessageCommand } from 'chooksie'

export default defineMessageCommand({
  name: 'First Word',
  async execute(ctx) {
    const msg = ctx.interaction.targetMessage
    const firstWord = msg.content.split(/ +/g)[0]
    await ctx.interaction.reply(`The first word is "${firstWord}"!`)
  },
})
