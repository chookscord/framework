import type * as lib from '@chookscord/lib';
import type { ModuleConfig, ReloadModule } from '../../../types';
import type { ChooksCommand } from '@chookscord/types';

export const commandModules = {
  get commands(): Promise<typeof import('./commands')> {
    return import('./commands');
  },
  get subcommands(): Promise<typeof import('./sub-commands')> {
    return import('./sub-commands');
  },
};

export async function loadCommands(
  config: ModuleConfig,
  dir: keyof typeof commandModules,
  store: lib.Store<ChooksCommand>,
): Promise<ReloadModule> {
  const commandModule = await commandModules[dir];
  return commandModule.init(config, store as lib.Store<never>);
}

export async function loadEvents(
  config: ModuleConfig,
): Promise<ReloadModule> {
  const events = await import('./events');
  return events.init(config);
}
