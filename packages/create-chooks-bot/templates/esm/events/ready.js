import { defineEvent } from 'chooksie'

export default defineEvent({
  name: 'ready',
  once: true,
  execute(ctx) {
    ctx.logger.info(`Logged in as ${ctx.client.user.username}!`)
  },
})
