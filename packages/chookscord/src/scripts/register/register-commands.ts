import * as lib from '@chookscord/lib';
import type { ChooksCommand } from '@chookscord/types';
import type { Config } from '../../types';

export type ProjectFiles = [config: Config, commands: ChooksCommand[]];

export async function registerCommands(
  project: Readonly<ProjectFiles>,
  options: Partial<lib.Logger> = {},
): Promise<void> {
  const [config, commands] = project;
  const interactions = lib.transformCommandList(commands);
  const register = lib.createRegister(config.credentials);
  const ok = await register(interactions);

  if (!ok || typeof ok === 'function') {
    options?.logger?.fatal(new Error('Could not register interactions!'));
    process.exit();
  }
}
