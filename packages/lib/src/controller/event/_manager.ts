import type { EventContext, EventStore } from '../..';
import { createEventRegister } from './_register';

export interface EventManager {
  load: () => void;
  unload: () => void;
}

export function createEventManager(
  store: EventStore,
  ctx: EventContext,
): EventManager {
  console.info('[Event Manager]: Event Manager created.');
  const register = createEventRegister(ctx);

  return {
    load() {
      console.info('[Event Manager]: Loading events...');
      let eventCount = 0;
      for (const event of store.getAll()) {
        register.set(event);
        eventCount++;
      }
      store.onSet(register.set);
      console.info(`[Event Manager]: ${eventCount} events loaded.`);
    },
    unload() {
      console.info('[Event Manager]: Unloading events...');
      register.clear();
      console.info('[Event Manager]: Events unloaded.');
    },
  };
}
