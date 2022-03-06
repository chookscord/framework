import { defineUserCommand } from 'chooksie'

export default defineUserCommand({
  name: 'High Five',
  type: 'USER', // You can "type" leave as is, or remove it entirely.
  async execute(ctx) {
    const user = ctx.interaction.user
    const target = ctx.interaction.targetUser
    await ctx.interaction.reply(`${user} High Fived ${target}!`)
  },
})
