import { ChooksCommand, ChooksSlashSubCommand, ChooksSubCommandOption } from '../types/chooks';
import { ChooksLogger } from '@chookscord/logger';
import { createCommandKey } from './utils';
import { createTimer } from './chrono';

export interface CommandReference {
  module: ChooksCommand | ChooksSubCommandOption;
  parent: ChooksCommand;
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
  command: ChooksSlashSubCommand,
): Generator<[string, CommandReference]> {
  const makeRef = (key: string, option: ChooksSubCommandOption): [string, CommandReference] => {
    const ref: CommandReference = {
      parent: command,
      module: option,
    };
    return [key, ref];
  };

  for (const option of command.options) {
    if (option.type === 'SUB_COMMAND') {
      const key = createCommandKey(command.name, option.name);
      yield makeRef(key, option as ChooksSubCommandOption);
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
