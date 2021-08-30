const { defineSlashCommand } = require('chookscord');

// This slash command will be accessible using /ping
module.exports = defineSlashCommand({
  name: 'ping',
  description: 'Replies with Pong!',
  // For beginners, we can also destructure our "context" object to make typing things shorter!
  // For more info: https://javascript.info/destructuring-assignment
  async execute({ logger, interaction }) {
    await interaction.reply('Pong!');
    logger.success('Replied with Pong!');
  },
});
