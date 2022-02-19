const { defineEvent } = require('chooksie')

module.exports = defineEvent({
  name: 'ready',
  once: true,
  execute(ctx) {
    ctx.logger.info(`Logged in as ${ctx.client.user.username}!`)
  },
})
