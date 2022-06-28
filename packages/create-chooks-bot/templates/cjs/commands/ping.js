const { defineSlashCommand } = require('chooksie')
const { MessageButton, MessageActionRow } = require('discord.js')

module.exports = defineSlashCommand({
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
