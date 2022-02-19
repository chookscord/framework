import type { Interaction } from 'discord.js'
import { Client } from 'discord.js'
import type { ChooksConfig, CommandStore } from '../types'
import createLogger from './logger'
import { resolveInteraction } from './resolve'

function createClient(config: Partial<ChooksConfig>): Client {
  const client = new Client({
    ...config.client?.options,
    intents: config.intents!,
  })

  return client
}

function onInteractionCreate(store: CommandStore): (interaction: Interaction) => Awaited<void> {
  const logger = createLogger()('app', 'interactions')
  return async (interaction: Interaction) => {
    const handler = resolveInteraction(store, interaction)
    if (!handler)
      return

    if (!handler.command) {
      logger.warn(`Handler for "${handler.key}" is missing.`)
      return
    }

    try {
      const client = interaction.client
      const _logger = handler.command.logger
      await handler.command.execute({ client, interaction, logger: _logger })
    } catch (error) {
      logger.error(`Handler for "${handler.key}" threw an error!`)
      logger.error(error)
    }
  }
}

export default createClient
export { onInteractionCreate }
