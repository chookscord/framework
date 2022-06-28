const { defineSlashCommand } = require('chooksie')
const { MessageActionRow, Modal, TextInputComponent } = require('discord.js')

module.exports = defineSlashCommand({
  name: 'modal',
  description: 'Run me to display a modal!',
  async execute(ctx) {
    const modal = new Modal()
      .setCustomId('test-modal')
      .setTitle('My Modal')

    const favoriteColorInput = new TextInputComponent()
      .setCustomId('favorite-color')
      .setLabel('What\'s your favorite color?')
      .setStyle('SHORT')

    const hobbiesInput = new TextInputComponent()
      .setCustomId('hobbies')
      .setLabel('What\'s some of your favorite hobbies?')
      .setStyle('PARAGRAPH')

    modal.addComponents(
      new MessageActionRow()
        .addComponents(favoriteColorInput),
      new MessageActionRow()
        .addComponents(hobbiesInput),
    )

    await ctx.interaction.showModal(modal)
  },
})
