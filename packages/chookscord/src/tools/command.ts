import type { Client, Interaction } from 'discord.js';
import { createLogger, fetch } from '@chookscord/lib';
import type { ChooksContext } from '@chookscord/types';
import type { Consola } from 'consola';
import { createTimer } from '../utils';

export function getCommandCtx(
  client: Client,
  commandName: string,
  interaction: Interaction,
): ChooksContext {
  return {
    fetch,
    client,
    interaction,
    logger: createLogger(`[commands] ${commandName}`),
  };
}

export async function executeCommand(
  commandName: string,
  execute: () => unknown,
  logger?: Consola,
): Promise<void> {
  try {
    logger?.info(`Executing command "${commandName}"...`);
    const endTimer = createTimer();
    await execute();
    logger?.success(`Finished executing command "${commandName}". Time took: ${endTimer().toLocaleString()}ms`);
  } catch (error) {
    logger?.error(`Failed to execute command "${commandName}"!`);
    logger?.error(error);
  }
}
