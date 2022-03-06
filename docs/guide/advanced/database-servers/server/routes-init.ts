import type { Context } from 'chooksie'
import type { FastifyPluginAsync } from 'fastify'

// We define our routes inside another function so we can pass our context
function register(ctx: Context): FastifyPluginAsync {
  const routes: FastifyPluginAsync = async app => {
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

export default register
