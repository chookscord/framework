import * as lib from '@chookscord/lib';
import type { Client, Interaction } from 'discord.js';
import { createTimer, resolveInteractionKey } from '../../../utils';
import type { ChooksContext } from '@chookscord/types';
import type { CommandModule } from '../../../types';
import type { Consola } from 'consola';

// Maybe extract
function getCtx(
  client: Client,
  commandName: string,
  interaction: Interaction,
): ChooksContext {
  return {
    fetch: lib.fetch,
    client,
    interaction,
    logger: lib.createLogger(`[commands] ${commandName}`),
  };
}

async function executeCommand(
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

export function attachInteractionListener(
  client: Client,
  store: lib.Store<CommandModule>,
  options: Partial<lib.Logger> = {},
): void {
  client.on('interactionCreate', interaction => {
    const commandName = resolveInteractionKey(interaction);
    if (!commandName) return;

    const command = store.get(commandName);
    if (!command) {
      options.logger?.warn(`Command "${commandName}" was executed, but no handlers were registered.`);
      return;
    }

    const ctx = getCtx(client, commandName, interaction);
    const execute = command.execute.bind(command, ctx);

    executeCommand(commandName, execute);
  });
}
