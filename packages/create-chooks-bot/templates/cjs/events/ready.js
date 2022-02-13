const { defineEvent } = require('chooksie')

module.exports = defineEvent({
  name: 'ready',
  once: true,
  execute(ctx) {
    console.log(`Logged in as ${ctx.client.user.username}!`)
  },
})
