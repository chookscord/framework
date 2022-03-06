function register(ctx) {
  const routes = async app => {
    // Some route just to check if our server works.
    app.get('/', async (req, reply) => {
      await reply.send({ env: process.env.NODE_ENV, time: Date.now() })
    })

    // A route to check our bot's ping.
    app.get('/ping', async (req, reply) => {
      await reply.send({ ping: ctx.client.ws.ping })
    })
  }

  return routes
}

module.exports = register
