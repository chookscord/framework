import * as lib from '@chookscord/lib';
import type * as types from '../../../types';
import * as utils from '../../../utils';
import type { Client } from 'discord.js';
import { basename } from 'path';
import { validateEvent } from '../../../tools';

export class EventHandler implements types.ModuleHandler {
  private _logger = lib.createLogger('[cli] Events');
  private _paths: Record<string, string> = {};

  constructor(
    private client: Client,
    private config: types.Config,
    private store: lib.Store<types.Event>,
  ) { }

  private _removeListener(event: types.Event) {
    this.client.removeListener(
      event.name,
      event.execute as never,
    );
    this._logger.debug(`Event "${event.name}" removed.`);
  }

  private _addListener(event: types.Event) {
    this._logger.debug(`Adding event "${event.name}".`);
    const frequency = event.once ? 'once' : 'on';
    const ctx: types.EventContext = {
      client: this.client,
      config: this.config,
      fetch: lib.fetch,
      logger: lib.createLogger(`[events] ${event.name}`),
    };

    // Overwrite handler and bind context. Needed to remove listener later.
    // Cheap way to bind context without adding another store, might be fragile.
    event.execute = event.execute.bind(event, ctx) as never;
    this.client[frequency](event.name, event.execute as never);
    this._logger.debug(`Event "${event.name}" added.`);
  }

  public init(): void {
    this.store.addEventListener('set', (a, b) => {
      if (b) this._removeListener(b);
      this._addListener(a);
    });
  }

  private _isEventInvalid(event: types.Event): boolean {
    const validationError = validateEvent(event);
    if (validationError) {
      this._logger.error(new Error(validationError));
    }
    return Boolean(validationError);
  }

  public update(filePath: string): void {
    const fileName = basename(filePath);
    this._logger.info(`"${fileName}" updated.`);

    const event = lib.pickDefault(lib.uncachedImport<types.Event>(filePath));
    if (this._isEventInvalid(event)) return;

    this.store.set(event.name, event);
    this._paths[filePath] = event.name;
  }

  public remove(filePath: string): void {
    const eventName = this._paths[filePath];
    delete this._paths[filePath];

    this.store.delete(eventName);
    this._logger.success(`types.Event "${eventName}" deleted.`);
  }
}
