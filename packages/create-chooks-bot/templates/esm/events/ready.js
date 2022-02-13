import { defineEvent } from 'chooksie'

export default defineEvent({
  name: 'ready',
  once: true,
  execute(ctx) {
    console.log(`Logged in as ${ctx.client.user.username}!`)
  },
})
