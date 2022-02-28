import { EventEmitter } from 'events'

interface StoreEvents<T> {
  add: [value: T, oldValue: T | null]
  delete: [oldValue: T]
}

interface StoreEmitter<T> extends EventEmitter {
  on: <Event extends keyof StoreEvents<T>>(eventName: Event, listener: (...args: StoreEvents<T>[Event]) => void) => this
  emit: <Event extends keyof StoreEvents<T>>(eventName: Event, ...args: StoreEvents<T>[Event]) => boolean
}

/**
 * A JavaScript {@link Map} with an {@link EventEmitter}.
 */
export default class Store<T> extends Map<string, T> {
  // Note: events is not available when super gets called with initial values
  public events = new EventEmitter() as StoreEmitter<T>
  public set(key: string, value: T): this {
    const oldValue = super.has(key)
      ? super.get(key)
      : null

    super.set(key, value)
    this.events?.emit('add', value, oldValue!)

    return this
  }
  public delete(key: string): boolean {
    const has = super.has(key)

    if (has) {
      const oldValue = super.get(key)
      super.delete(key)
      this.events?.emit('delete', oldValue!)
    }

    return has
  }
}
