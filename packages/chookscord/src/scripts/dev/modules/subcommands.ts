import * as lib from '@chookscord/lib';
import * as utils from '../../../utils';
import type { ChooksCommand, ChooksSubCommand } from '@chookscord/types';
import type { Consola } from 'consola';
import { basename } from 'path';

type Store = lib.Store<ChooksCommand>;

function isCommandValid(
  command: ChooksSubCommand,
  logger?: Consola,
): boolean {
  const validationError = lib.validateSubCommand(command);
  if (validationError) {
    logger?.error(new Error(validationError));
  }
  return !validationError;
}

export async function update(
  paths: Record<string, string>,
  store: Store,
  filePath: string,
  logger?: Consola,
): Promise<void> {
  const fileName = basename(filePath);
  const endTimer = utils.createTimer();
  logger?.info(`"${fileName}" updated.`);

  const command = lib.pickDefault(await lib.uncachedImport<ChooksSubCommand>(filePath));
  if (isCommandValid(command)) {
    store.set(command.name, command);
    paths[filePath] = command.name;
    logger?.success(`Command "${command.name}" loaded. Time took: ${endTimer().toLocaleString()}ms`);
  }
}

export function unlink(
  paths: Record<string, string>,
  store: Store,
  filePath: string,
  logger?: Consola,
): void {
  const commandName = paths[filePath];
  delete paths[filePath];

  store.delete(commandName);
  logger?.success(`Command "${commandName}" deleted.`);
}
