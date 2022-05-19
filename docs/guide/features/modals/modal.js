import { defineModalHandler } from 'chooksie'

export default defineModalHandler({
  customId: 'tag-image',
  setup: () => import('../db'),
  async execute(ctx) {
    const messageId = ctx.interaction.message.id
    // IMPORTANT: this must match the text input's customId
    const tagList = ctx.interaction.fields.getTextInputValue('tag-list')

    await ctx.interaction.deferReply({
      ephemeral: true,
    })

    await this.db.tags.save({
      id: messageId,
      tags: tagList.split(/ +/g),
    })

    await ctx.interaction.editReply('Image tagged!')
  },
})
