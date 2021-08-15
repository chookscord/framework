import { Event, EventName } from '../..';

export class EventStore {
  private _store = new Set<Event>();

  public set(event: Event): void {
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
}
