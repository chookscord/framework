/* eslint-disable complexity */
import { Command, TextCommand } from '../../types';
import { isTextCommand } from '../../utils/command-guard';

export class CommandStore<T extends Command | TextCommand> {
  private _store = new Map<string, T>();

  public set(commandName: string, command: T): void {
    this._store.set(commandName.toLowerCase(), command);
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
}
