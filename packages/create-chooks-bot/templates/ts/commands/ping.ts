import { defineSlashCommand } from 'chooksie'

export default defineSlashCommand({
  name: 'ping',
  description: 'Pong!',
  async execute(ctx) {
    await ctx.interaction.reply('Pong!')
  },
})
