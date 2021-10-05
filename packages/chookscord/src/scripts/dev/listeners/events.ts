import * as lib from '@chookscord/lib';
import type { Client, ClientEvents } from 'discord.js';
import type { Config, Event, EventContext } from '../../../types';
import type { Consola } from 'consola';

export function attachEventListener(
  store: lib.Store<Event>,
  client: Client,
  config: Config,
  logger?: Consola,
): void {
  function addListener(event: Event) {
    logger?.debug(`Adding event "${event.name}".`);
    const frequency = event.once ? 'once' : 'on';
    const ctx: EventContext = {
      client,
      config,
      fetch: lib.fetch,
      logger: lib.createLogger(`[events] ${event.name}`),
    };

    const _execute = event.execute;
    const execute = async (...args: ClientEvents[typeof event.name]) => {
      const deps = await event.dependencies?.call(undefined) ?? {};
      // @ts-ignore ts can't infer ...args
      _execute.call(deps, ctx, ...args);
    };

    // Overwrite handler. Needed to remove listener later.
    // Cheap way to bind context without adding another store, might be fragile.
    event.execute = execute as never;
    client[frequency](event.name, execute);
    logger?.debug(`Event "${event.name}" added.`);
  }

  function removeListener(event: Event): void {
    client.removeListener(
      event.name,
      event.execute as never,
    );
    logger?.debug(`Event "${event.name}" removed.`);
  }

  store.addEventListener('set', (event, oldEvent) => {
    if (oldEvent) {
      removeListener(oldEvent);
    }
    addListener(event);
  });
}
