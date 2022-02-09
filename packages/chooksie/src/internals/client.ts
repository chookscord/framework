import type { Interaction } from 'discord.js'
import { Client } from 'discord.js'
import type { ChooksConfig, GenericHandler } from '../types'
import { resolveInteraction } from './resolve'

function createClient(config: Partial<ChooksConfig>): Client {
  const client = new Client({
    ...config.client?.options,
    intents: config.intents!,
  })

  return client
}

function onInteractionCreate(store: Map<string, GenericHandler>): (interaction: Interaction) => Awaited<void> {
  return async (interaction: Interaction) => {
    const handler = resolveInteraction(store, interaction)
    if (!handler)
      return

    if (!handler.execute) {
      console.warn(`Handler for "${handler.key}" is missing.`)
      return
    }

    try {
      const client = interaction.client
      await handler.execute({ client, interaction })
    } catch (error) {
      console.error(`Handler for "${handler.key}" threw an error!`)
      console.error(error)
    }
  }
}

export default createClient
export { onInteractionCreate }
