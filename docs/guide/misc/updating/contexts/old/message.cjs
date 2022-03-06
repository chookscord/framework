const { defineContextCommand } = require('chooksie')

module.exports = defineContextCommand({
  name: 'First Word',
  type: 'MESSAGE',
  async execute(ctx) {
    const message = ctx.interaction.options.getMessage('message', true)
    const firstWord = message.content.split(' ')[0]
    await ctx.interaction.reply(`The first word was: "${firstWord}"`)
  },
})
