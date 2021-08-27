/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as chooks from '@chookscord/lib';
import type { ExtractArgs } from '@chookscord/lib/src/utils/types/_extract';

describe('event store', () => {
  const store = new chooks.EventStore();

  const event1 = {
    name: 'ready',
    execute() { /*  */ },
  } as chooks.Event;

  const event2 = {
    name: 'error',
    execute() { /*  */ },
  } as chooks.Event;

  it('should get and set', () => {
    expect(store.size).toBe(0);
    store.set(event1.name, event1);
    const event = store.get(event1.name);
    expect(event).toBe(event1);
    expect(store.size).toBe(1);
  });

  it('should emit on set', () => {
    const listener = jest.fn<unknown, ExtractArgs<chooks.EventSetListener>>((event, oldEvent) => {
      if (event.name === 'ready') {
        expect(event).toBe(event1);
        expect(oldEvent).toBe(event1);
      } else if (event.name === 'error') {
        expect(event).toBe(event2);
        expect(oldEvent).toBe(null);
      }
    });

    store.addEventListener('set', listener);
    expect(store.size).toBe(1);

    store.set(event1.name, event1);
    store.set(event2.name, event2);
    store.removeEventListener('set', listener);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.size).toBe(2);
  });

  it('should emit on delete', () => {
    const listener = jest.fn<unknown, ExtractArgs<chooks.EventRemoveListener>>(oldEvent => {
      if (oldEvent.name === 'ready') {
        expect(oldEvent).toBe(event1);
      } else if (oldEvent.name === 'error') {
        expect(oldEvent).toBe(event2);
      }
    });

    store.addEventListener('remove', listener);
    expect(store.size).toBe(2);

    store.delete(event1.name);
    store.delete(event2.name);
    store.removeEventListener('remove', listener);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.size).toBe(0);
  });
});
