import { Event, EventName } from '../..';

export type EventStoreListener = (
  newEvent: Event,
  oldEvent: Event | null
) => unknown;

export class EventStore {
  private _store = new Set<Event>();
  private _listeners = new Set<EventStoreListener>();

  private _findDupe(event: Event): Event | null {
    for (const oldEvent of this._store.values()) {
      if (oldEvent.id === event.id) {
        return oldEvent;
      }
    }
    return null;
  }

  public set(event: Event): void {
    if (typeof event.id === 'string') {
      const dupeEvent = this._findDupe(event);
      this._emit(event, dupeEvent);
      if (dupeEvent) {
        this._store.delete(dupeEvent);
      }
    } else {
      this._emit(event, null);
      this.remove(event.name);
    }

    this._store.add(event);
  }

  public *get<T extends EventName>(eventName: T): Iterable<Event<T>> {
    for (const event of this._store.values()) {
      if (event.name === eventName) {
        yield event as Event<T>;
      }
    }
  }

  public getAll(): Iterable<Event> {
    return this._store.values();
  }

  public toArray(): Event[] {
    return [...this.getAll()];
  }

  public get count(): number {
    return this.count;
  }

  public remove(eventName: EventName): void {
    for (const event of this.get(eventName)) {
      this._store.delete(event);
    }
  }

  public clear(): void {
    this._store.clear();
  }

  public onSet(listener: EventStoreListener): void {
    this._listeners.add(listener);
  }

  public removeListener(listener: EventStoreListener): void {
    this._listeners.delete(listener);
  }

  private _emit(newEvent: Event, oldEvent: Event | null) {
    this._listeners.forEach(fn => fn(newEvent, oldEvent));
  }
}
