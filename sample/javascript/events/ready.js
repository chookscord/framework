const { defineEvent } = require('chookscord');

module.exports = defineEvent({
  name: 'ready',
  once: true, // Set this to true if you only want to run an event once
  execute({ logger, client }) {
    logger.success(`${client.user.username} now logged in using chookscord!`);
  },
});
