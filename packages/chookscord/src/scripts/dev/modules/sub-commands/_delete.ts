import type { Consola } from 'consola';
import type { UpdateListener } from '../../compiler';

export function createOnDelete(
  logger: Consola,
  paths: Record<string, string>,
): UpdateListener {
  return filePath => {
    const commandName = paths[filePath];
    logger.debug(`Deleting command "${commandName}"...`);

    delete paths[filePath];
    // delete from store
    logger.debug(`Command "${commandName}" deleted. Reregistering...`);

    // register
    logger.debug('Reregistering complete.');
  };
}
