import type * as lib from '@chookscord/lib';
import type { ClientEvents } from 'discord.js';
import type { Consola } from 'consola';
import type { UpdateListener } from '../../compiler';

export function createOnDelete(
  logger: Consola,
  paths: Record<string, keyof ClientEvents>,
  store: lib.Store<lib.Event>,
): UpdateListener {
  return filePath => {
    logger.debug('Event deleted.');
    const eventName = paths[filePath];
    store.delete(eventName);
    logger.success(`Deleted event "${eventName}".`);
  };
}
