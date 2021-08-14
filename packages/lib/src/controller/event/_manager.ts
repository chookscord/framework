import type { Event, EventContext } from '../../types';
import { createEventRegister } from './_register';
import { loadFiles } from '../../tools/import-files';

export interface EventManager {
  load: () => Promise<void>;
  reload: () => Promise<void>;
}

export function createEventManager(
  ctx: EventContext,
  eventsDir: string,
): EventManager {
  console.info('[Event Manager]: Event Manager created.');
  const eventRegister = createEventRegister(ctx);

  const load: EventManager['load'] = async () => {
    console.info('[Event Manager]: Loading events...');
    let eventCount = 0;
    for await (const event of loadFiles<Event>(eventsDir)) {
      eventRegister.set(event);
      eventCount++;
    }
    console.info(`[Event Manager]: ${eventCount} events loaded.`);
  };

  const reload: EventManager['reload'] = async () => {
    console.info('[Event Manager]: Reloading...');
    eventRegister.clear();
    await load();
    console.info('[Event Manager]: Reloaded.');
  };

  return {
    load,
    reload,
  };
}
