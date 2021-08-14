import { Event, EventContext } from '../../types';

export interface EventRegister {
  set: (event: Event) => void;
  clear: () => void;
}

export function createEventRegister(
  ctx: EventContext,
): EventRegister {
  console.debug('[Event Register]: Event Register created.');
  const set: EventRegister['set'] = event => {
    const frequency = event.once ? 'once' : 'on';
    ctx.client[frequency](
      event.name,
      (...args) => event.execute(ctx, ...args),
    );
    console.info(`[Event Register]: Registered event "${event.name}" to client.`);
  };

  const clear: EventRegister['clear'] = () => {
    ctx.client.removeAllListeners();
    console.info('[Event Register]: Cleared client event listeners.');
  };

  return {
    set,
    clear,
  };
}
