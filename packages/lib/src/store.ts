import type { Consola } from 'consola';
import type { ExtractArgs } from './utils/types/_extract';
import { createLogger } from './utils';

export type StoreSetListener<T> = (
  value: T,
  oldValue: T | null
) => unknown;

export type StoreRemoveListener<T> = (
  oldValue: T
) => unknown;

export interface StoreOptions {
  name?: string;
}

export class Store<T> {
  private _logger?: Consola;
  constructor(options: StoreOptions = {}) {
    if (options.name) {
      this._logger = createLogger(`[store] ${options.name}`);
    }
  }

  private _store = new Map<string, T>();
  private _setListeners = new Set<StoreSetListener<T>>();
  private _removeListeners = new Set<StoreRemoveListener<T>>();

  public get(key: string): T | null {
    this._logger?.debug('Get:', key);
    return this._store.get(key) ?? null;
  }

  public set(key: string, value: T): void {
    this._logger?.debug('Set:', key);
    const oldValue = this.get(key);
    this._store.set(key, value);
    this._emit('set', value, oldValue);
  }

  public delete(key: string): void {
    this._logger?.debug('Delete:', key);
    const oldValue = this.get(key);
    this._store.delete(key);

    if (oldValue) {
      this._emit('remove', oldValue);
    }
  }

  public *getAll(): Iterable<T> {
    this._logger?.debug('GetAll');
    const set = new Set(this._store.values());
    for (const value of set) {
      yield value;
    }
  }

  public toArray(): T[] {
    this._logger?.debug('ToArray');
    return [...this.getAll()];
  }

  public get size(): number {
    const set = new Set(this._store.values());
    return set.size;
  }

  public clear(): void {
    this._logger?.debug('Clear');
    this._store.clear();
  }

  private _emit(
    event: 'set',
    ...args: ExtractArgs<StoreSetListener<T>>
  ): void;
  private _emit(
    event: 'remove',
    ...args: ExtractArgs<StoreRemoveListener<T>>
  ): void;
  private _emit(
    event: 'set' | 'remove',
    ...args: [value: T, oldValue?: T | null]
  ): void {
    this._logger?.debug('Emit:', event);
    const listenerName = `_${event}Listeners` as const;
    for (const listener of this[listenerName]) {
      listener(...args as [T, T | null]);
    }
  }

  public addEventListener<Event extends 'set' | 'remove'>(
    event: Event,
    listener: Event extends 'set'
      ? StoreSetListener<T>
      : Event extends 'remove'
        ? StoreRemoveListener<T>
        : never,
  ): void {
    const listenerName = `_${event}Listeners` as const;
    // @ts-ignore This is logically correct and type-safe, but TS doesn't agree >:(
    this[listenerName].add(listener);
    this._logger?.trace('Listener added.');
  }

  public removeEventListener<Event extends 'set' | 'remove'>(
    event: Event,
    listener: Event extends 'set'
      ? StoreSetListener<T>
      : Event extends 'remove'
        ? StoreRemoveListener<T>
        : never,
  ): void {
    const listenerName = `_${event}Listeners` as const;
    // @ts-ignore See reason above
    this[listenerName].delete(listener);
    this._logger?.trace('Listener removed.');
  }
}
