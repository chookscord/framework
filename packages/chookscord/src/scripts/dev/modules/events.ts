import * as lib from '@chookscord/lib';
import type * as types from '../../../types';
import * as utils from '../../../utils';
import { UpdateListener, createWatchCompiler } from '../compiler';
import { ClientEvents } from 'discord.js';
import { createLogger } from '@chookscord/lib';

const logger = lib.createLogger('[cli] Events');

// eslint-disable-next-line complexity
function validateEvent(
  filePath: string,
  event: lib.Event,
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

function createOnCompile(
  paths: Record<string, keyof ClientEvents>,
  store: lib.EventStore,
  ctx: types.ModuleContext,
): UpdateListener {
  return async filePath => {
    logger.debug('Event updated.');
    const event: lib.Event = await utils.uncachedImportDefault<lib.Event>(filePath);
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
      logger: createLogger(`[events] ${event.name}`),
    }) as unknown as typeof event.execute;

    logger.trace('Adding listener to store.');
    store.set(
      event.name,
      event,
    );

    paths[filePath] = event.name;
  };
}

function createOnDelete(
  paths: Record<string, keyof ClientEvents>,
  store: lib.EventStore,
): UpdateListener {
  return filePath => {
    const eventName = paths[filePath];
    store.delete(eventName);
  };
}

export function init(config: types.ModuleConfig): types.ReloadModule {
  let ctx = config.ctx;
  const paths: Record<string, keyof ClientEvents> = {};
  const store = new lib.EventStore();

  const reload: types.ReloadModule = newCtx => {
    logger.info('Refreshing events...');
    ctx = newCtx;
    for (const event of store.getAll()) {
      const frequency = event.once
        ? 'once'
        : 'on';

      ctx.client[frequency](
        event.name,
        event.execute as (...args: unknown[]) => void,
      );
    }
    logger.success('Events refreshed.');
  };

  const removeEvent = (event: lib.Event) => {
    ctx.client.removeListener(
      event.name,
      event.execute as (...args: unknown[]) => void,
    );
  };

  const setEvent: lib.EventSetListener = (event, oldEvent) => {
    logger.info(`Attaching "${event.name}" listener...`);
    const stopTimer = utils.createTimer();
    if (oldEvent) {
      logger.debug(`Removing old "${oldEvent.name}" listener.`);
      removeEvent(oldEvent);
      logger.debug(`Old "${oldEvent.name}" listener removed.`);
    }

    logger.trace('Attaching listener to client.');
    const frequency = event.once ? 'once' : 'on';
    ctx.client[frequency](
      event.name,
      event.execute as (...args: unknown[]) => void,
    );

    logger.success(`"${event.name}" listener attached. Time took: ${stopTimer().toLocaleString()}ms`);
  };

  createWatchCompiler({
    ...config,
    onCompile: createOnCompile(paths, store, ctx),
    onDelete: createOnDelete(paths, store),
  });

  store.addEventListener('set', setEvent);
  store.addEventListener('remove', removeEvent);

  return reload;
}
