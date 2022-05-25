const { defineSlashCommand } = require('chooksie')
const { MessageActionRow, MessageButton } = require('discord.js')

module.exports = defineSlashCommand({
  name: 'timer',
  description: 'Starts a timer.',
  async execute(ctx) {
    const now = Date.now()

    const button = new MessageButton()
      .setCustomId(`timer-end|${now}`)
      .setEmoji('⏱️')
      .setLabel('Stop Timer')
      .setStyle('DANGER')

    const row = new MessageActionRow()
      .addComponents(button)

    await ctx.interaction.reply({
      content: 'Timer started!',
      components: [row],
    })
  },
})
