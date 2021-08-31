import { ModuleConfig, ReloadModule } from '../../../types';

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
): Promise<ReloadModule> {
  const commandModule = await commandModules[dir];
  return commandModule.init(config);
}

export async function loadEvents(
  config: ModuleConfig,
): Promise<ReloadModule> {
  const events = await import('./events');
  return events.init(config);
}
