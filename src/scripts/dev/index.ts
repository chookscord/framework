import { createClient, loadConfig } from '@chookscord/lib';
import { createEventContext } from './utils';
import { createManagers } from './managers';
import { register } from 'ts-node';

register({
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
  },
});

export async function init(): Promise<void> {
  const config = await loadConfig();
  if (!config) return;

  const client = createClient(config);
  const eventCtx = createEventContext(client.self, config);
  const managers = createManagers(eventCtx);

  // Need to login first before registering slash commands
  await client.login();
  await managers.load();
}
