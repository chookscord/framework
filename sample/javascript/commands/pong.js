const { defineTextCommand } = require('chookscord');

// This text command will be accessible using ${prefix}pong
module.exports = defineTextCommand({
  text: true, // This is important to make the framework register this a text command!
  name: 'pong',
  description: 'Replies with Ping!',
  async execute(ctx) {
    await ctx.message.reply('Ping!');
  },
});
