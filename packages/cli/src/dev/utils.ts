import { Config, EventContext, fetch } from '@chookscord/lib';
import { Client } from 'discord.js';

export function createEventContext(
  client: Client,
  config: Config,
): EventContext {
  return { client, config, fetch };
}