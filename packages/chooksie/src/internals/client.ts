import type { Interaction } from 'discord.js'
import { Client } from 'discord.js'
import type { ChooksConfig, CommandStore } from '../types'
import { resolveInteraction } from './resolve'

function createClient(config: Partial<ChooksConfig>): Client {
  const client = new Client({
    ...config.client?.options,
    intents: config.intents!,
  })

  return client
}

function onInteractionCreate(store: CommandStore): (interaction: Interaction) => Awaited<void> {
  return async (interaction: Interaction) => {
    const handler = resolveInteraction(store, interaction)
    if (!handler)
      return

    if (!handler.command) {
      console.warn(`Handler for "${handler.key}" is missing.`)
      return
    }

    try {
      const client = interaction.client
      const logger = handler.command.logger
      await handler.command.execute({ client, interaction, logger })
    } catch (error) {
      console.error(`Handler for "${handler.key}" threw an error!`)
      console.error(error)
    }
  }
}

export default createClient
export { onInteractionCreate }
