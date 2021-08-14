import type { ClientInterface, Config } from './types';
import { Client } from 'discord.js';

export function createClient(config: Config): ClientInterface {
  console.info('[Client]: Client created.');
  const client = new Client({
    ...config.client?.config,
    intents: config.intents,
  });

  return {
    get self() {
      return client;
    },
    async login() {
      console.info('[Client]: Logging in...');
      await client.login(config.token);
      console.info('[Client]: Logged in.');
    },
  };
}
