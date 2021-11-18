/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ChooksCommand, Config } from 'chooksie/types';
import { createRegister, transformCommandList } from '../../lib';
import type { ChooksLogger } from '@chookscord/logger';

export type ProjectFiles = [config: Config, commands: ChooksCommand[]];

export async function registerCommands(
  project: Readonly<ProjectFiles>,
  logger?: ChooksLogger,
): Promise<void> {
  const [config, commands] = project;

  logger?.info(`Preparing ${commands.length} commands...`);
  const interactions = transformCommandList(commands);

  logger?.info(`Registering ${interactions.length} interactions...`);
  const register = createRegister(config.credentials);
  const response = await register(interactions);

  if (response.ok) {
    logger?.success(`Successfully registered ${interactions.length} interactions.`);
  } else {
    logger?.fatal(new Error(response.error!));
    process.exit();
  }
}
