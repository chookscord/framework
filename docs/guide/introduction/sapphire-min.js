import { Command } from '@sapphire/framework'

export class PingCommand extends Command {
  constructor(context) {
    super(context, {
      description: 'Pong!',
      chatInputCommand: {
        register: true,
      },
    })
  }
  async chatInputRun(interaction) {
    await interaction.reply('Pong!')
  }
}
