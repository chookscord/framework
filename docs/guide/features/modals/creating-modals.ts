import { defineMessageCommand } from 'chooksie'
import type { ModalActionRowComponent } from 'discord.js'
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js'

export default defineMessageCommand({
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
      new MessageActionRow<ModalActionRowComponent>()
        .addComponents(tagList),
    )

    await ctx.interaction.showModal(modal)
  },
})
