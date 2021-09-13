import * as lib from '@chookscord/lib';
import * as utils from '../../../../utils';
import type { ChooksSubCommand } from '@chookscord/types';
import type { Consola } from 'consola';
import type { UpdateListener } from '../../compiler';

export function createOnCompile(
  logger: Consola,
  paths: Record<string, string>,
  store: lib.Store<ChooksSubCommand>,
  register: () => unknown,
): UpdateListener {
  return async filePath => {
    logger.debug('Reloading sub command...');
    const endTimer = utils.createTimer();
    const command = await utils.uncachedImportDefault<ChooksSubCommand>(filePath);

    const errorMessage = lib.validateSubCommand(command);
    if (errorMessage) {
      logger.error(new Error(errorMessage));
      return;
    }

    const oldCommand: ChooksSubCommand | null = store.get(command.name);
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

    logger.debug('Command details did not chagned.');
  };
}
