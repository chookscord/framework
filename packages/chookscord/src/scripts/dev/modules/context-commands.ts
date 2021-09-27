import * as lib from '@chookscord/lib';
import type * as types from '@chookscord/types';
import * as utils from '../../../utils';
import { ModuleHandler } from '../../../types';
import { basename } from 'path';

export class ContextCommandHandler implements ModuleHandler {
  private _logger = lib.createLogger('[cli] ContextCommands');
  private _paths: Record<string, string> = {};

  constructor(private store: lib.Store<types.ChooksCommand>) { }

  private _isCommandInvalid(command: types.ChooksContextCommand): boolean {
    const validationError = lib.validateContextCommand(command);
    if (validationError) {
      this._logger.error(new Error(validationError));
    }
    return Boolean(validationError);
  }

  public update(filePath: string): void {
    const fileName = basename(filePath);
    const endTimer = utils.createTimer();
    this._logger.info(`"${fileName}" updated.`);

    const command = lib.pickDefault(lib.uncachedImport<types.ChooksContextCommand>(filePath));
    if (this._isCommandInvalid(command)) return;

    this.store.set(command.name, command);
    this._paths[filePath] = command.name;
    this._logger.success(`Command "${command.name}" loaded. Time took: ${endTimer().toLocaleString()}ms`);
  }

  public remove(filePath: string): void {
    const commandName = this._paths[filePath];
    delete this._paths[filePath];

    this.store.delete(commandName);
    this._logger.success(`Command "${commandName}" deleted.`);
  }
}
