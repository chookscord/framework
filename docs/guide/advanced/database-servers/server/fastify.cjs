const { defineOnLoad } = require('chooksie')
const { fastify } = require('fastify')
const register = require('./register')

// Set our port as an env variable, and fallback to port 3000 if none was set.
const PORT = process.env.PORT ?? 3000

exports.chooksOnLoad = defineOnLoad(async ctx => {
  const app = fastify({
    // Since Fastify actually uses Pino under the hood for logging, we can
    // pass "type": "fastify" to enable logging integration with Chooksie!
    logger: ctx.logger.child({ type: 'fastify' }),
  })

  // Here we register all our routes before starting the server.
  await app.register(register(ctx))

  // Start listening on our specified port.
  await app.listen(PORT)

  // Stop our server when it gets updated.
  return async () => {
    ctx.logger.info('Stopping server...')
    await app.close()
  }
})
