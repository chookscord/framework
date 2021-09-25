import * as lib from '@chookscord/lib';
import * as utils from '../../../utils';
import type { ChooksUserCommand } from '@chookscord/types';
import { basename } from 'path';

const logger = lib.createLogger('[cli] UserCommands');

// @todo(Choooks22): Bind dependencies to 'this'
function prepareCommand(
  command: ChooksUserCommand,
): [key: string, command: ChooksUserCommand] {
  const execute = command.execute.bind(command);
  return [command.name, { ...command, execute }];
}

export async function *getUserCommands(
  rootPath: string,
): AsyncGenerator<[key: string, command: ChooksUserCommand]> {
  for await (const file of lib.loadDir(rootPath)) {
    if (file.isDirectory) continue;
    const endTimer = utils.createTimer();

    const fileName = basename(file.path);
    logger.info(`Loading command "${fileName}"...`);

    const command = await utils.importDefault<ChooksUserCommand>(file.path);
    logger.success(`Loaded command "${command.name}". Time took: ${endTimer().toLocaleString()}ms`);
    yield prepareCommand(command);
  }
}
