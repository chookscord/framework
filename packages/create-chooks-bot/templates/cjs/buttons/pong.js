const { defineButtonHandler } = require('chooksie')

module.exports = defineButtonHandler({
  customId: 'pong',
  async execute(ctx) {
    await ctx.interaction.reply('Pong!')
  },
})
