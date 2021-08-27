import type { ExtractArgs, ExtractSet } from '../../utils/types/_extract';
import type { Command } from '../../types';
import { createLogger } from '../../utils/logger';

export type CommandSetListener = (
  command: Command,
  oldCommand: Command | null
) => unknown;

export type CommandRemoveListener = (
  oldCommand: Command,
) => unknown;

interface CommandCacheListeners {
  set: Set<CommandSetListener>;
  remove: Set<CommandRemoveListener>;
}

export class CommandStore<T extends Command> {
  private static _logger = createLogger('[lib] Command Store');
  // eslint-disable-next-line class-methods-use-this
  private get _log() {
    return CommandStore._logger;
  }

  private _store = new Map<string, T>();
  private _listeners: CommandCacheListeners = {
    set: new Set(),
    remove: new Set(),
  };

  public get(commandName: string): T | null {
    this._log.debug('Get:', commandName);
    return this._store.get(commandName) ?? null;
  }

  public set(commandName: string, command: T): void {
    this._log.debug('Set:', commandName);
    const oldCommand = this.get(commandName);
    this._store.set(commandName, command);
    this._emit('set', command, oldCommand);
  }

  public delete(commandName: string): void {
    this._log.debug('Delete:', commandName);
    const oldCommand = this.get(commandName);
    if (oldCommand) {
      this._store.delete(commandName);
      this._emit('remove', oldCommand);
    }
  }

  public getAll(): Iterable<T> {
    return this._store.values();
  }

  public toArray(): T[] {
    return [...this.getAll()];
  }

  public get size(): number {
    return new Set(this.getAll()).size;
  }

  public clear(): void {
    this._log.info('Store cleared.');
    const uniqueCommandList = new Set(this.getAll()).values();
    for (const command of uniqueCommandList) {
      this._emit('remove', command);
    }
    this._store.clear();
  }

  private _emit<Event extends keyof CommandCacheListeners>(
    event: Event,
    ...args: ExtractArgs<ExtractSet<CommandCacheListeners[Event]>>
  ): void {
    this._log.debug('Emit:', event);
    this._listeners[event].forEach(listener => {
      // @ts-ignore This is logically correct and type-safe, but TS doesn't agree >:(
      listener(...args);
    });
  }

  public addEventListener<Event extends keyof CommandCacheListeners>(
    event: Event,
    listener: ExtractSet<CommandCacheListeners[Event]>,
  ): void {
    this._log.trace('Listener added.');
    // @ts-ignore Same thing here as well
    this._listeners[event].add(listener);
  }

  public removeEventListener<Event extends keyof CommandCacheListeners>(
    event: Event,
    listener: ExtractSet<CommandCacheListeners[Event]>,
  ): void {
    this._log.trace('Listener removed.');
    // @ts-ignore Same thing here as well
    this._listeners[event].delete(listener);
  }
}
