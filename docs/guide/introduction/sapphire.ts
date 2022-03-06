import { Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'

export class PingCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      description: 'Pong!',
      chatInputCommand: {
        register: true,
      },
    })
  }
  public async chatInputRun(interaction: CommandInteraction) {
    await interaction.reply('Pong!')
  }
}
