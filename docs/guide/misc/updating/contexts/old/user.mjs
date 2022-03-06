import { defineContextCommand } from 'chooksie'

export default defineContextCommand({
  name: 'High Five',
  type: 'USER',
  async execute(ctx) {
    const user = ctx.interaction.user
    const target = ctx.interaction.getUser('user', true)
    await ctx.interaction.reply(`${user} High Fived ${target}!`)
  },
})
