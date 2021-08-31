import * as lib from '@chookscord/lib';
import type { Consola } from 'consola';
import type { UpdateListener } from '../../compiler';

export function createOnDelete(
  logger: Consola,
  paths: Record<string, string>,
  store: lib.Store<lib.BaseSlashCommand>,
  register: () => unknown,
): UpdateListener {
  return async filePath => {
    const commandName = paths[filePath];
    logger.debug(`Deleting command "${commandName}"...`);

    delete paths[filePath];
    store.delete(commandName);
    logger.debug(`Command "${commandName}" deleted. Reregistering...`);

    await register();
    logger.debug('Reregistering complete.');
  };
}
