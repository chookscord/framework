import { Client } from 'discord.js';
import type { Config } from '../types';

export function createClient(config: Config): Client {
  return new Client({
    ...config.client?.config,
    intents: config.intents,
  });
}
