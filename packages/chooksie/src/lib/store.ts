import { ChooksLogger, createLogger } from '@chookscord/logger';
import { EventEmitter } from 'events';

export interface StoreOptions {
  /** Only used for adding a logger. */
  name?: string;
}

export interface StoreEvents<T> {
  set: [value: T, oldValue: T | null];
  remove: [value: T | null];
}

/**
 * A Map-like object with listeners.
 */
export class Store<T> {
  private logger: ChooksLogger | null = null;
  private store = new Map<string, T>();
  private emitter = new EventEmitter();

  constructor(options: StoreOptions = {}) {
    if (options.name) {
      this.logger = createLogger(options.name);
    }
  }

  public get(key: string): T | null {
    this.logger?.trace(`get "${key}".`);
    return this.store.get(key) ?? null;
  }

  public set(key: string, value: T): this {
    this.logger?.trace(`set "${key}".`);
    const oldValue = this.get(key);
    this.store.set(key, value);
    this.emit('set', value, oldValue);
    return this;
  }

  public delete(key: string): boolean {
    this.logger?.trace(`delete "${key}".`);
    const oldValue = this.get(key);
    this.emit('remove', oldValue);
    return this.store.delete(key);
  }

  public getAll(unique?: boolean): Iterable<T> {
    this.logger?.trace('getAll: unique:', unique);
    return unique
      ? new Set(this.store.values()).values()
      : this.store.values();
  }

  public entries(): Iterable<[string, T]> {
    this.logger?.trace('entries');
    return this.store.entries();
  }

  public toArray(unique?: boolean): T[] {
    this.logger?.trace('toArray: unique:', unique);
    return [...this.getAll(unique)];
  }

  public clear(): void {
    this.logger?.debug('Cleared store.');
    this.store.clear();
  }

  public get size(): number {
    return this.store.size;
  }

  public get sizeUnique(): number {
    return new Set(this.store.values()).size;
  }

  public on<K extends keyof StoreEvents<T>>(
    eventName: K,
    listener: (...args: StoreEvents<T>[K]) => void,
  ): this {
    this.emitter.on(eventName, listener as never);
    return this;
  }

  public off<K extends keyof StoreEvents<T>>(
    eventName: K,
    listener: (...args: StoreEvents<T>[K]) => void,
  ): this {
    this.emitter.off(eventName, listener as never);
    return this;
  }

  private emit<K extends keyof StoreEvents<T>>(
    eventName: K,
    ...args: StoreEvents<T>[K]
  ): boolean {
    return this.emitter.emit(eventName, ...args);
  }
}
