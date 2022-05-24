const { defineSlashCommand } = require('chooksie')
const { MessageActionRow, MessageButton } = require('discord.js')

module.exports = defineSlashCommand({
  name: 'joke',
  description: 'Sends a random joke.',
  setup: () => require('../api'),
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
