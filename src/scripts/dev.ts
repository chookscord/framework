import {
  Config,
  createClient,
  createCommandManager,
  createEventManager,
  fetch,
  loadConfig,
} from '@chookscord/lib';
import type { Client } from 'discord.js';
import type { EventContext } from '@chookscord/lib';
import { register } from 'ts-node';

register({ compilerOptions: { module: 'CommonJS' } });

function createEventContext(client: Client, config: Config): EventContext {
  return { client, config, fetch };
}

function createManagers(ctx: EventContext) {
  const eventHandler = createEventManager(ctx);
  const commandHandler = createCommandManager(ctx);

  const load = async () => {
    await Promise.all([
      eventHandler.load(),
      commandHandler.load(),
    ]);
  };

  return {
    event: eventHandler,
    command: commandHandler,
    load,
  };
}

export async function init(): Promise<void> {
  const config = await loadConfig();
  if (!config) return;

  const client = createClient(config);
  const eventCtx = createEventContext(client.self, config);
  const managers = createManagers(eventCtx);

  await managers.load();
  await client.login();
}
