import { defineSlashCommand } from 'chooksie'
import { MessageButton, MessageActionRow } from 'discord.js'

export default defineSlashCommand({
  name: 'ping',
  description: 'Pong!',
  async execute(ctx) {
    const button = new MessageButton()
      .setCustomId('pong')
      .setStyle('PRIMARY')
      .setEmoji('🏓')
      .setLabel('Ping')

    await ctx.interaction.reply({
      content: 'Pong!',
      components: [
        new MessageActionRow()
          .addComponents(button),
      ],
    })
  },
})
