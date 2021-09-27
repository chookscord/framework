import * as lib from '@chookscord/lib';
import type * as types from '@chookscord/types';
import * as utils from '../../../utils';
import { ModuleHandler } from '../../../types';
import { basename } from 'path';

export class SubCommandHandler implements ModuleHandler {
  private _logger = lib.createLogger('[cli] SubCommands');
  private _paths: Record<string, string> = {};

  constructor(private store: lib.Store<types.ChooksCommand>) { }

  private _isCommandInvalid(command: types.ChooksSubCommand): boolean {
    const validationError = lib.validateSubCommand(command);
    if (validationError) {
      this._logger.error(new Error(validationError));
    }
    return Boolean(validationError);
  }

  public async update(filePath: string): Promise<void> {
    const fileName = basename(filePath);
    const endTimer = utils.createTimer();
    this._logger.info(`"${fileName}" updated.`);

    const command = lib.pickDefault(await lib.uncachedImport<types.ChooksSubCommand>(filePath));
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
