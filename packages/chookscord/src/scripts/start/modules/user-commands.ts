import * as lib from '@chookscord/lib';
import * as utils from '../../../utils';
import type { ChooksContextCommand } from '@chookscord/types';
import { basename } from 'path';

const logger = lib.createLogger('[cli] UserCommands');

// @todo(Choooks22): Bind dependencies to 'this'
function prepareCommand(
  command: ChooksContextCommand,
): [key: string, command: ChooksContextCommand] {
  const execute = command.execute.bind(command);
  return [command.name, { ...command, execute }];
}

export async function *getUserCommands(
  rootPath: string,
): AsyncGenerator<[key: string, command: ChooksContextCommand]> {
  for await (const file of lib.loadDir(rootPath)) {
    if (file.isDirectory) continue;
    const endTimer = utils.createTimer();

    const fileName = basename(file.path);
    logger.info(`Loading command "${fileName}"...`);

    const command = await utils.importDefault<ChooksContextCommand>(file.path);
    logger.success(`Loaded command "${command.name}". Time took: ${endTimer().toLocaleString()}ms`);
    yield prepareCommand(command);
  }
}
