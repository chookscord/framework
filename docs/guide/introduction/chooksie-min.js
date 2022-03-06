export default {
  name: 'ping',
  description: 'Pong!',
  async execute(ctx) {
    await ctx.interaction.reply('Pong!')
  },
}
