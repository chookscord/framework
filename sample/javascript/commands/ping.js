const { defineCommand } = require('chookscord');

// This slash command will be accessible using /ping
module.exports = defineCommand({
  name: 'ping',
  description: 'Replies with Pong!',
  // For beginners, we can also destructure our "context" object to make typing things shorter!
  // For more info: https://javascript.info/destructuring-assignment
  async execute({ interaction }) {
    await interaction.reply('Pong!');
  },
});
