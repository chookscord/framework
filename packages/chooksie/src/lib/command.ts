import type * as types from '../types/chooks';
import { ChooksLogger, createLogger } from '@chookscord/logger';
import type { Client, Interaction } from 'discord.js';
import { createCommandKey } from './utils';
import { createTimer } from './chrono';
import { fetch } from '@chookscord/fetch';

export interface CommandReference {
  module: types.ChooksCommand | types.ChooksSubCommandOption;
  parent: types.ChooksCommand;
}

export function getCommandCtx<T extends types.ChooksContextCommandContext | types.ChooksCommandContext>(
  client: Client,
  commandName: string,
  interaction: Interaction,
): T {
  return {
    fetch,
    client,
    interaction,
    logger: createLogger(`[commands] ${commandName}`),
  } as T;
}

export async function executeCommand(
  commandName: string,
  execute: () => unknown,
  logger?: ChooksLogger,
): Promise<void> {
  try {
    logger?.info(`Executing command "${commandName}"...`);
    const endTimer = createTimer();
    await execute();
    logger?.success(`Finished executing command "${commandName}". Time took: ${endTimer()}`);
  } catch (error) {
    logger?.error(`Failed to execute command "${commandName}"!`);
    logger?.error(error);
  }
}

// eslint-disable-next-line complexity
export function *extractSubCommands(
  command: types.ChooksSlashSubCommand,
): Generator<[string, CommandReference]> {
  const makeRef = (key: string, option: types.ChooksSubCommandOption): [string, CommandReference] => {
    const ref: CommandReference = {
      parent: command,
      module: option,
    };
    return [key, ref];
  };

  for (const option of command.options) {
    if (option.type === 'SUB_COMMAND') {
      const key = createCommandKey(command.name, option.name);
      yield makeRef(key, option as types.ChooksSubCommandOption);
      continue;
    }
    if (option.type === 'SUB_COMMAND_GROUP') {
      for (const subCommand of option.options) {
        const key = createCommandKey(command.name, option.name, subCommand.name);
        yield makeRef(key, subCommand);
      }
    }
  }
}
