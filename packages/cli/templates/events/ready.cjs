const { defineEvent } = require('chooksie');

module.exports = defineEvent({
  name: 'ready',
  once: true,
  execute(ctx) {
    ctx.logger.success(`Logged in as ${ctx.client.user.username} using chooksie!`);
  },
});
