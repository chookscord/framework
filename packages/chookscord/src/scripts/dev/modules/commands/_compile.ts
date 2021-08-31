import * as lib from '@chookscord/lib';
import * as path from 'path';
import * as utils from '../../../../utils';
import type { Consola } from 'consola';
import type { UpdateListener } from '../../compiler';

function validateCommand(
  filePath: string,
  command: lib.BaseSlashCommand,
): string | null {
  return command
    ? lib.validateSlashCommand(command)
    : `${path.dirname(filePath)} does not have a default export!`;
}

export function createOnCompile(
  logger: Consola,
  paths: Record<string, string>,
  store: lib.Store<lib.BaseSlashCommand>,
  register: () => unknown,
): UpdateListener {
  return async filePath => {
    logger.debug('Reloading command...');
    const endTimer = utils.createTimer();
    const command = await utils.uncachedImportDefault<lib.BaseSlashCommand>(filePath);
    const errorMessage = validateCommand(filePath, command);
    if (errorMessage) {
      logger.error(new Error(errorMessage));
      return;
    }

    const oldCommand = store.get(command.name);
    const didChange = utils.slashCommandChanged(command, oldCommand);

    paths[filePath] = command.name;
    store.set(command.name, command);
    logger.debug(`Command reloaded. Time took: ${endTimer().toLocaleString()}ms`);

    if (didChange) {
      logger.debug('Command details changed. Reregistering...');
      await register();
      logger.debug('Reregistering complete.');
      return;
    }

    logger.debug('Command details did not changed.');
  };
}
