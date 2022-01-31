import { Client } from 'discord.js'
import type { ChooksConfig } from '../types'

function createClient(config: Partial<ChooksConfig>): Client {
  const client = new Client({
    ...config.client?.options,
    intents: config.intents!,
  })

  return client
}

export default createClient
