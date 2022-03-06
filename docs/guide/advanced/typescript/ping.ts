import type { SlashCommand } from 'chooksie'

const pingCommand: SlashCommand = {
  name: 'ping',
  description: 'Pong!',
  async execute(ctx) {
    await ctx.interaction.reply('Pong!')
  },
}

export default pingCommand
