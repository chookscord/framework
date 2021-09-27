/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as lib from '@chookscord/lib';
import type { ChooksCommand } from '@chookscord/types';
import type { Config } from '../../types';
import type { Consola } from 'consola';

export type ProjectFiles = [config: Config, commands: ChooksCommand[]];

export async function registerCommands(
  project: Readonly<ProjectFiles>,
  logger?: Consola,
): Promise<void> {
  const [config, commands] = project;

  logger?.info(`Preparing ${commands.length} commands...`);
  const interactions = lib.transformCommandList(commands);

  logger?.info(`Registering ${interactions.length} interactions...`);
  const register = lib.createRegister(config.credentials);
  const response = await register(interactions);

  if (response.ok) {
    logger?.success(`Successfully registered ${interactions.length} interactions.`);
  } else {
    logger?.fatal(new Error(response.error!));
    process.exit();
  }
}
