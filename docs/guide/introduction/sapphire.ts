import { Command } from '@sapphire/framework';

export class PingCommand extends Command {
	public constructor(context: Command.Context) {
		super(context, {
			description: 'Pong!'
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputInteraction) {
		return interaction.reply('Pong!');
	}
}
