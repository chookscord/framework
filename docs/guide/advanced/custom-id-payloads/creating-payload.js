import { defineSlashCommand } from 'chooksie'
import { MessageActionRow, MessageButton } from 'discord.js'

export default defineSlashCommand({
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
