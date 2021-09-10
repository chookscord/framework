import * as lib from '@chookscord/lib';
import * as types from '../../../../types';
import * as utils from '../../../../utils';
import type { ClientEvents } from 'discord.js';
import type { Consola } from 'consola';
import type { UpdateListener } from '../../compiler';

// eslint-disable-next-line complexity
function validateEvent(
  filePath: string,
  event: types.Event,
): string | null {
  if (JSON.stringify(event) === '{}') {
    return `"${filePath}" does not have a default export!`;
  }

  if (!event.name || typeof event.name !== 'string') {
    return `"${filePath}" does not have a n`;
  }

  if (typeof event.execute !== 'function') {
    return `"${event.name}" handler does not have an execute handler!`;
  }

  return null;
}

export function createOnCompile(
  logger: Consola,
  paths: Record<string, keyof ClientEvents>,
  store: lib.Store<types.Event>,
  ctx: types.ModuleContext,
): UpdateListener {
  return async filePath => {
    logger.debug('Event updated.');
    const event: types.Event = await utils.uncachedImportDefault<types.Event>(filePath);
    const validationError = validateEvent(filePath, event);

    if (validationError) {
      logger.error(new Error(validationError));
      return;
    }

    // Bind context to handler. Needed to remove listener later.
    // Might be fragile, but we'll see.
    logger.trace('Binding context to handler.');
    event.execute = event.execute.bind(event, {
      client: ctx.client,
      config: ctx.config,
      fetch: lib.fetch,
      logger: lib.createLogger(`[events] ${event.name}`),
    }) as unknown as typeof event.execute;

    logger.trace('Adding listener to store.');
    store.set(
      event.name,
      event,
    );

    paths[filePath] = event.name;
  };
}
