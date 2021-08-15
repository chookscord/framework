import { Event, EventName } from '../..';

type EventListener = (event: Event) => unknown;

export class EventStore {
  private _store = new Set<Event>();
  private _listeners = new Set<EventListener>();

  public set(event: Event): void {
    this._store.add(event);
    this._emit(event);
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
    return this.toArray().length;
  }

  public remove(eventName: EventName): void {
    for (const event of this._store.values()) {
      if (event.name === eventName) {
        this._store.delete(event);
      }
    }
  }

  public clear(): void {
    this._store.clear();
  }

  public onSet(listener: EventListener): void {
    this._listeners.add(listener);
  }

  public removeListener(listener: EventListener): void {
    this._listeners.delete(listener);
  }

  private _emit(event: Event) {
    this._listeners.forEach(fn => fn(event));
  }
}
