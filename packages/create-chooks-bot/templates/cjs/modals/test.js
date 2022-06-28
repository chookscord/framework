const { defineModalHandler } = require('chooksie')

module.exports = defineModalHandler({
  customId: 'test-modal',
  async execute(ctx) {
    const favoriteColor = ctx.interaction.fields.getTextInputValue('favorite-color')
    const hobbies = ctx.interaction.fields.getTextInputValue('hobbies')

    const data = { favoriteColor, hobbies }
    ctx.logger.info(`Got submission: ${JSON.stringify(data)}`)

    await ctx.interaction.reply('Your submission was recieved successfully!')
  },
})
