const { defineButtonHandler } = require('chooksie')

module.exports = defineButtonHandler({
  customId: 'delete-msg',
  async execute(ctx) {
    await ctx.interaction.deferReply({
      ephemeral: true,
    })

    const message = ctx.interaction.message
    await message.delete()

    await ctx.interaction.editReply({
      content: 'Message deleted!',
    })
  },
})
