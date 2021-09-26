import * as lib from '@chookscord/lib';
import type * as types from '@chookscord/types';
import { createCommandKey, createTimer } from '../../../utils';
import { basename } from 'path';

const logger = lib.createLogger('[cli] SubCommands');

export interface SubCommandReference {
  parent: types.ChooksSubCommand;
  execute: Exclude<types.ChooksCommand['execute'], undefined>;
}

// @todo(Choooks22): Bind dependencies to 'this'
function createCommandReference(
  command: types.ChooksSubCommand,
  execute: SubCommandReference['execute'],
): SubCommandReference {
  return {
    parent: command,
    execute: execute.bind(command),
  };
}

// eslint-disable-next-line complexity
function *extractOptions(
  command: types.ChooksSubCommand,
  subOption?: types.ChooksSubCommandOption | types.ChooksGroupCommandOption,
  subCommand?: types.ChooksSubCommandOption,
): Generator<[key: string, command: SubCommandReference]> {
  if (!subOption) {
    for (const option of command.options) {
      yield* extractOptions(command, option);
    }
    return;
  }

  if (subCommand) {
    const names = [command.name, subOption.name, subCommand.name] as const;
    const commandKey = createCommandKey(...names);
    yield [commandKey, createCommandReference(command, subCommand.execute)];
    return;
  }

  switch (subOption.type) {
    case 'SUB_COMMAND': {
      const names = [command.name, subOption.name] as const;
      const commandKey = createCommandKey(...names);
      yield [commandKey, createCommandReference(command, subOption.execute)];
      return;
    }
    case 'SUB_COMMAND_GROUP':
      for (const option of subOption.options) {
        yield* extractOptions(command, subOption, option);
      }
  }
}

export async function *getSubCommands(
  rootPath: string,
): AsyncGenerator<[key: string, command: SubCommandReference]> {
  for await (const file of lib.loadDir(rootPath)) {
    if (file.isDirectory) continue;
    const endTimer = createTimer();

    const fileName = basename(rootPath);
    logger.info(`Loading command "${fileName}"...`);

    const command = lib.pickDefault(await import(file.path) as types.ChooksSubCommand);
    logger.success(`Loaded command "${command.name}". Time took: ${endTimer().toLocaleString()}ms`);
    yield* extractOptions(command);
  }
}
