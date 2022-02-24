const { defineEvent } = require('chooksie')

module.exports = defineEvent({
  name: 'guildCreate',
  execute(ctx, guild) {
    ctx.logger.info(`Joined a new server with ${guild.memberCount} user!`)
  },
})
