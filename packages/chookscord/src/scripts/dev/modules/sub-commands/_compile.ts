import * as lib from '@chookscord/lib';
import * as utils from '../../../../utils';
import type { Consola } from 'consola';
import type { UpdateListener } from '../../compiler';


export function createOnCompile(
  logger: Consola,
  paths: Record<string, string>,
): UpdateListener {
  return filePath => {
    logger.debug('Reloading sub command...');
    const endTimer = utils.createTimer();
    const command = {} as lib.SlashSubCommand; // import file

    // check difference

    paths[filePath] = command.name;
    // set to store
    logger.debug(`Command reloaded. Time took: ${endTimer().toLocaleString()}ms`);

    // check did change
    logger.debug('Command details did not chagned.');
  };
}
