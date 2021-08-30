import { defineSlashCommand } from 'chookscord';

export default defineSlashCommand({
  name: 'ping',
  description: 'Replies with Pong!',
  // Destructuring the "context" object is the recommended way to do things.
  // Unless you have a lot of objects you want to access inside context, there's really no reason not to.
  // You're in typescript, so I assume you already know destructuring :) if not check the js part of this command
  async execute({ logger, interaction }) {
    await interaction.reply('Pong!');
    logger.success('Replied with Pong!');
  },
});
