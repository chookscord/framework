import type { ExtractArgs, ExtractSet } from '../../utils/types/_extract';
import type { ClientEvents } from 'discord.js';
import type { Event } from '../../types';
import { createLogger } from '../../utils/logger';

export type EventSetListener = (
  event: Event,
  oldEvent: Event | null
) => unknown;

export type EventRemoveListener = (
  oldEvent: Event
) => unknown;

interface EventStoreListener {
  set: Set<EventSetListener>;
  remove: Set<EventRemoveListener>;
}

export class EventStore {
  private static _logger = createLogger('[lib] Event Store');
  // eslint-disable-next-line class-methods-use-this
  private get _log() {
    return EventStore._logger;
  }

  private _store = new Map<keyof ClientEvents, Event>();
  private _listeners: EventStoreListener = {
    set: new Set(),
    remove: new Set(),
  };

  public get<T extends keyof ClientEvents>(eventName: T): Event<T> | null {
    this._log.debug('Get:', eventName);
    return this._store.get(eventName) as unknown as Event<T> ?? null;
  }

  public set<T extends keyof ClientEvents>(eventName: T, event: Event<T>): void {
    this._log.debug('Set:', event.name, eventName);
    // Alias event to be more generic since TS keeps shitting itself
    const _event = event as unknown as Event;
    const oldEvent = this.get(eventName) as unknown as Event;
    this._store.set(eventName, _event);
    this._emit('set', _event, oldEvent);
  }

  public delete(eventName: keyof ClientEvents): void {
    this._log.debug('Delete:', eventName);
    const oldEvent = this.get(eventName);
    if (oldEvent) {
      this._store.delete(eventName);
      this._emit('remove', oldEvent);
    }
  }

  public getAll(): Iterable<Event> {
    return this._store.values();
  }

  public toArray(): Event[] {
    return [...this.getAll()];
  }

  public get size(): number {
    return this._store.size;
  }

  public clear(): void {
    this._log.info('Store cleared.');
    for (const event of this.getAll()) {
      this._emit('remove', event);
    }
    this._store.clear();
  }

  private _emit<Event extends keyof EventStoreListener>(
    event: Event,
    ...args: ExtractArgs<ExtractSet<EventStoreListener[Event]>>
  ) {
    this._log.debug('Emit:', event);
    this._listeners[event].forEach(listener => {
      // @ts-ignore Same story as the one in command store
      listener(...args);
    });
  }

  public addEventListener<Event extends keyof EventStoreListener>(
    eventName: Event,
    listener: ExtractSet<EventStoreListener[Event]>,
  ): void {
    this._log.trace('Listener added.');
    // @ts-ignore See above
    this._listeners[eventName].add(listener);
  }

  public removeEventListener<Event extends keyof EventStoreListener>(
    eventName: Event,
    listener: ExtractSet<EventStoreListener[Event]>,
  ): void {
    this._log.trace('Listener removed.');
    // @ts-ignore See above
    this._listeners[eventName].delete(listener);
  }
}
