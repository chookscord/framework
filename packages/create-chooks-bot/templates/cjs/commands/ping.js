const { defineSlashCommand } = require('chooksie')

module.exports = defineSlashCommand({
  name: 'ping',
  description: 'Pong!',
  async execute(ctx) {
    await ctx.interaction.reply('Pong!')
  },
})
