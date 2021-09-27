import * as lib from '@chookscord/lib';
import type { Config, Event, EventContext } from '../../../types';
import type { Client } from 'discord.js';
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

    // Overwrite handler and bind context. Needed to remove listener later.
    // Cheap way to bind context without adding another store, might be fragile.
    event.execute = event.execute.bind(event, ctx) as never;
    client[frequency](event.name, event.execute as never);
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
