const { defineOnLoad } = require('chooksie')

exports.chooksOnLoad = defineOnLoad(ctx => {
  ctx.logger.info('Starting timer!')
  const interval = setInterval(() => {
    ctx.logger.info(`Our bot's ping is ${ctx.client.ws.ping}!`)
  }, 1000)

  return () => {
    ctx.logger.info('Turning off timer!')
    clearInterval(interval)
  }
})
