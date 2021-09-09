import * as lib from '@chookscord/lib';
import type * as types from '../../../../types';
import * as utils from '../../../../utils';
import type { ClientEvents } from 'discord.js';
import { createOnCompile } from './_compile';
import { createOnDelete } from './_delete';
import { createWatchCompiler } from '../../compiler';

const logger = lib.createLogger('[cli] Events');

export function init(config: types.ModuleConfig): types.ReloadModule {
  let ctx = config.ctx;
  const paths: Record<string, keyof ClientEvents> = {};
  const store = new lib.Store<lib.Event>({
    name: 'Events',
  });

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

  const setEvent: lib.StoreSetListener<lib.Event> = (event, oldEvent) => {
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
    onCompile: createOnCompile(logger, paths, store, ctx),
    onDelete: createOnDelete(logger, paths, store),
  });

  store.addEventListener('set', setEvent);
  store.addEventListener('remove', removeEvent);

  return reload;
}
