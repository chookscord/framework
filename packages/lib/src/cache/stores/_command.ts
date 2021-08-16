/* eslint-disable complexity */
import { SlashCommand, TextCommand } from '../../types';
import { isTextCommand } from '../../utils/command-guard';

export type CommandStoreListener<T> = (command: T) => unknown;

export class CommandStore<T extends SlashCommand | TextCommand> {
  private _store = new Map<string, T>();
  private _listeners = new Set<CommandStoreListener<T>>();

  public set(commandName: string, command: T): void {
    this._store.set(commandName.toLowerCase(), command);
    this._emit(command);
  }

  public get(commandName: string): T | null {
    return this._store.get(commandName.toLowerCase()) ?? null;
  }

  public getAll(): Iterable<T> {
    return new Set(this._store.values()).values();
  }

  public toArray(): T[] {
    return [...this.getAll()];
  }

  public get count(): number {
    return this.toArray().length;
  }

  private _delete(commandName: string): void {
    this._store.delete(commandName.toLowerCase());
  }

  public remove(commandName: string): void {
    const command = this.get(commandName);

    if (command) {
      this._delete(command.name);
      if (isTextCommand(command) && Array.isArray(command.aliases)) {
        command.aliases.forEach(this._delete, this);
      }
    }
  }

  public clear(): void {
    this._store.clear();
  }

  public onSet(listener: CommandStoreListener<T>): void {
    this._listeners.add(listener);
  }

  public removeListener(listener: CommandStoreListener<T>): void {
    this._listeners.delete(listener);
  }

  private _emit(command: T) {
    this._listeners.forEach(fn => fn(command));
  }
}
