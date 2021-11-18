import type { ChooksConfig, ChooksEvent, ChooksEventContext } from 'chooksie/types';
import { ChooksLogger, createLogger } from '@chookscord/logger';
import type { Client, ClientEvents } from 'discord.js';
import { Store } from 'chooksie/lib';
import { fetch } from '@chookscord/fetch';

export function attachEventListener(
  store: Store<ChooksEvent>,
  client: Client,
  config: ChooksConfig,
  logger?: ChooksLogger,
): void {
  function addListener(event: ChooksEvent) {
    logger?.debug(`Adding event "${event.name}".`);
    const frequency = event.once ? 'once' : 'on';
    const ctx: ChooksEventContext = {
      client,
      config,
      fetch,
      logger: createLogger(`[events] ${event.name}`),
    };

    const _execute = event.execute;
    const execute = async (...args: ClientEvents[typeof event.name]) => {
      const deps = await event.setup?.call(undefined) ?? {};
      // @ts-ignore ts can't infer ...args
      _execute.call(deps, ctx, ...args);
    };

    // Overwrite handler. Needed to remove listener later.
    // Cheap way to bind context without adding another store, might be fragile.
    event.execute = execute as never;
    client[frequency](event.name, execute);
    logger?.debug(`Event "${event.name}" added.`);
  }

  function removeListener(event: ChooksEvent): void {
    client.removeListener(
      event.name,
      event.execute as never,
    );
    logger?.debug(`Event "${event.name}" removed.`);
  }

  store.on('set', (event, oldEvent) => {
    if (oldEvent) {
      removeListener(oldEvent);
    }
    addListener(event);
  });
}
