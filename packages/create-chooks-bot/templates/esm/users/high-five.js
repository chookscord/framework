import { defineUserCommand } from 'chooksie'

export default defineUserCommand({
  name: 'High Five',
  async execute(ctx) {
    const user = ctx.interaction.user
    const target = ctx.interaction.targetUser
    await ctx.interaction.reply(`${user} High Fived ${target}!`)
  },
})
