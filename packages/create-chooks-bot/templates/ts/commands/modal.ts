import { defineSlashCommand } from 'chooksie'
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js'

export default defineSlashCommand({
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
      new MessageActionRow<TextInputComponent>()
        .addComponents(favoriteColorInput),
      new MessageActionRow<TextInputComponent>()
        .addComponents(hobbiesInput),
    )

    await ctx.interaction.showModal(modal)
  },
})
