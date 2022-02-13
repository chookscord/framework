const { defineUserCommand } = require('chooksie')

module.exports = defineUserCommand({
  name: 'High Five',
  async execute(ctx) {
    const user = ctx.interaction.user
    const target = ctx.interaction.targetUser
    await ctx.interaction.reply(`${user} High Fived ${target}!`)
  },
})
