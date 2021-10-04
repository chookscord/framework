import * as lib from '@chookscord/lib';
import type * as types from '@chookscord/types';
import { createCommandKey, createTimer } from '../../../utils';
import { basename } from 'path';

const logger = lib.createLogger('[cli] SubCommands');

export interface SubCommandReference {
  parent: types.ChooksSubCommand;
  execute: (ctx: types.ChooksCommandContext) => unknown;
}

async function createCommandReference(
  command: types.ChooksSubCommand,
  subCommand: types.ChooksSubCommandOption<Record<string, unknown>>,
): Promise<SubCommandReference> {
  const deps = await subCommand.dependencies?.call(undefined) ?? {};
  return {
    parent: command,
    execute: subCommand.execute.bind(deps),
  };
}

// eslint-disable-next-line complexity
async function *extractOptions(
  command: types.ChooksSubCommand,
  subOption?: types.ChooksSubCommandOption | types.ChooksGroupCommandOption,
  subCommand?: types.ChooksSubCommandOption,
): AsyncGenerator<[key: string, command: SubCommandReference]> {
  if (!subOption) {
    for (const option of command.options) {
      yield* extractOptions(command, option);
    }
    return;
  }

  if (subCommand) {
    const names = [command.name, subOption.name, subCommand.name] as const;
    const commandKey = createCommandKey(...names);
    yield [commandKey, await createCommandReference(command, subCommand)];
    return;
  }

  switch (subOption.type) {
    case 'SUB_COMMAND': {
      const names = [command.name, subOption.name] as const;
      const commandKey = createCommandKey(...names);
      yield [commandKey, await createCommandReference(command, subOption)];
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
  for await (const file of lib.loadDir(rootPath, { recursive: true })) {
    if (file.isDirectory) continue;
    const endTimer = createTimer();

    const fileName = basename(rootPath);
    logger.info(`Loading command "${fileName}"...`);

    const command = lib.pickDefault(await import(file.path) as types.ChooksSubCommand);
    logger.success(`Loaded command "${command.name}". Time took: ${endTimer().toLocaleString()}ms`);
    yield* extractOptions(command);
  }
}
