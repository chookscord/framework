const { defineSlashCommand } = require('chooksie');

module.exports = defineSlashCommand({
  name: 'say',
  description: 'Repeats your message.',
  async execute(ctx) {
    const message = ctx.interaction.options.getString('message', true);
    await ctx.interaction.reply(message);
    ctx.logger.success(`I just said "${message}"!`);
  },
  options: [
    {
      name: 'message',
      description: 'The message to say.',
      type: 'STRING',
      required: true,
    },
  ],
});
