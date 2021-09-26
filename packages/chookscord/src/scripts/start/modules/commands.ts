import * as lib from '@chookscord/lib';
import * as utils from '../../../utils';
import type { ChooksSlashCommand } from '@chookscord/types';
import { basename } from 'path';

const logger = lib.createLogger('[cli] Commands');

// @todo(Choooks22): Bind dependencies to 'this'
function prepareCommand(
  command: ChooksSlashCommand,
): [key: string, command: ChooksSlashCommand] {
  const execute = command.execute.bind(command);
  return [command.name, { ...command, execute }];
}

export async function *getCommands(
  rootPath: string,
): AsyncGenerator<[key: string, command: ChooksSlashCommand]> {
  for await (const file of lib.loadDir(rootPath)) {
    if (file.isDirectory) continue;
    const endTimer = utils.createTimer();

    const fileName = basename(file.path);
    logger.info(`Loading command "${fileName}"...`);

    const command = lib.pickDefault(await import(file.path) as ChooksSlashCommand);
    logger.success(`Loaded command "${command.name}". Time took: ${endTimer().toLocaleString()}ms`);
    yield prepareCommand(command);
  }
}
