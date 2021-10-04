import * as lib from '@chookscord/lib';
import * as utils from '../../../utils';
import type { ChooksSlashCommand } from '@chookscord/types';
import { basename } from 'path';

const logger = lib.createLogger('[cli] Commands');

async function prepareCommand(
  command: ChooksSlashCommand,
): Promise<[key: string, command: ChooksSlashCommand]> {
  const deps = await command.dependencies?.call(undefined) ?? {};
  const execute = command.execute.bind(deps);
  return [command.name, { ...command, execute }];
}

export async function *getCommands(
  rootPath: string,
): AsyncGenerator<[key: string, command: ChooksSlashCommand]> {
  for await (const file of lib.loadDir(rootPath, { recursive: true })) {
    if (file.isDirectory) continue;
    const endTimer = utils.createTimer();

    const fileName = basename(file.path);
    logger.info(`Loading command "${fileName}"...`);

    const command = lib.pickDefault(await import(file.path) as ChooksSlashCommand);
    logger.success(`Loaded command "${command.name}". Time took: ${endTimer().toLocaleString()}ms`);
    yield prepareCommand(command);
  }
}
