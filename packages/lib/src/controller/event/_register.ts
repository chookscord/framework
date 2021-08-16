import { Event, EventContext } from '../../types';
import { Awaited } from 'discord.js';
import { EventStoreListener } from '../../cache';

export interface EventRegister {
  set: EventStoreListener;
  remove: (event: Event) => void;
}

export function createEventRegister(
  ctx: EventContext,
): EventRegister {
  console.debug('[Event Register]: Event Register created.');

  return {
    // @Choooks22: Not sure if this works 100%, might cause leaks, idk
    set(event, oldEvent) {
      const frequency = event.once ? 'once' : 'on';
      // Might break idfk, just make sure to never call set
      // twice on the same event module
      event.execute = event.execute.bind(event, ctx);
      if (oldEvent) {
        ctx.client.removeListener(
          oldEvent.name,
          oldEvent.execute,
        );
      } else {
        ctx.client.removeAllListeners(event.name);
      }
      ctx.client[frequency](
        event.name,
        event.execute as () => Awaited<void>,
      );
      console.info(`[Event Register]: Registered event "${event.name}" to client.`);
    },
    remove(event) {
      ctx.client.removeListener(
        event.name,
        event.execute,
      );
      console.info(`[Event Register]: Removed event "${event.name}" from client.`);
    },
  };
}
