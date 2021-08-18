import { defineTextCommand } from 'chookscord';

// This text command will be accessible using ${prefix}pong
export default defineTextCommand({
  text: true, // Typescript should warn you anyways if you don't have this defined.
  name: 'pong',
  description: 'Replies with Ping!',
  async execute(ctx) {
    await ctx.message.reply('Ping!');
  },
});
