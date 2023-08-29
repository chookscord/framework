import { Command } from '@sapphire/framework';

export class PingCommand extends Command {
  constructor(context) {
    super(context, {
      description: 'Pong!'
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder //
          .setName(this.name)
          .setDescription(this.description)
    );
  }

  async chatInputRun(interaction) {
    return interaction.reply('Pong!');
  }
}
