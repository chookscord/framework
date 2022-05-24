import { defineSlashCommand } from 'chooksie'
import { MessageActionRow, MessageButton } from 'discord.js'

export default defineSlashCommand({
  name: 'joke',
  description: 'Sends a random joke.',
  setup: () => import('../api'),
  async execute(ctx) {
    const joke = await this.getRandomJoke()

    const button = new MessageButton()
      // IMPORTANT: this must match the handler's customId
      .setCustomId('delete-msg')
      .setStyle('DANGER')
      .setEmoji('🗑️')

    const row = new MessageActionRow()
      .addComponents(button)

    await ctx.interaction.reply({
      content: joke,
      components: [row],
    })
  },
})
