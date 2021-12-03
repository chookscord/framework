const { defineContextCommand } = require('chooksie');

module.exports = defineContextCommand({
  name: 'High Five',
  type: 'USER',
  async execute(ctx) {
    const user = ctx.interaction.user;
    const target = ctx.interaction.options.getUser('user', true);
    await ctx.interaction.reply(`${user} High Fived ${target}!`);
  },
});
