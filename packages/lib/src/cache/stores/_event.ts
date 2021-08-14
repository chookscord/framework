import { Event, EventName } from '../..';

export class EventStore {
  private _store = new Map<EventName, Event>();

  public set<T extends EventName>(eventName: T, event: Event<T>): void {
    this._store.set(eventName, event);
  }

  public get<T extends EventName>(eventName: T): Event<T> | null {
    return this._store.get(eventName) as Event<T> ?? null;
  }

  public getAll(): Iterable<[EventName, Event]> {
    return this._store.entries();
  }

  public toArray(): [EventName, Event][] {
    return [...this.getAll()];
  }

  public get count(): number {
    return this.toArray().length;
  }

  public remove(eventName: EventName): void {
    this._store.delete(eventName);
  }

  public clear(): void {
    this._store.clear();
  }
}
