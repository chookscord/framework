const { defineMessageCommand } = require('chooksie')
const { MessageActionRow, Modal, TextInputComponent } = require('discord.js')

module.exports = defineMessageCommand({
  name: 'Tag Image',
  async execute(ctx) {
    const modal = new Modal()
      // IMPORTANT: this must match the handler's customId
      .setCustomId('tag-image')
      .setTitle('Create a new Tag')

    const tagList = new TextInputComponent()
      .setCustomId('tag-list')
      .setLabel('Tags')
      .setPlaceholder('Separate tags with spaces.')
      .setStyle('PARAGRAPH')
      .setRequired()

    modal.addComponents(
      new MessageActionRow()
        .addComponents(tagList),
    )

    await ctx.interaction.showModal(modal)
  },
})
