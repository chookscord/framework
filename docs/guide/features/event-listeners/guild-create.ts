import { defineEvent } from 'chooksie'

export default defineEvent({
  name: 'guildCreate',
  execute(ctx, guild) {
    ctx.logger.info(`Joined a new server with ${guild.memberCount} user!`)
  },
})
