import * as lib from '@chookscord/lib';
import type { ChooksCommand, ChooksContextCommand } from '@chookscord/types';
import type { Consola } from 'consola';
import type { Module } from '../load-modules';
import { basename } from 'path';
import { createTimer } from '../../../utils';

type Store = lib.Store<ChooksCommand>;

function isCommandValid(
  command: ChooksContextCommand,
  logger?: Consola,
): boolean {
  const validationError = lib.validateContextCommand(command);
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
  const endTimer = createTimer();
  logger?.info(`"${fileName}" updated.`);

  logger?.debug(`Importing "${fileName}"...`);
  const commandData = await lib.uncachedImport<ChooksContextCommand>(filePath);
  const command = lib.pickDefault(commandData);

  logger?.debug('Import OK. Validating command...');
  if (isCommandValid(command, logger)) {
    store.set(command.name, command);
    paths[filePath] = command.name;
    logger?.success(`Command "${command.name}" loaded. Time took: ${endTimer().toLocaleString()}ms`);
  }
}

export function remove(
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

export function createModule(
  store: Store,
  logger?: Consola,
): Module {
  const paths = {};
  return {
    async compile(filePath: string) {
      await update(paths, store, filePath, logger);
    },
    unlink(filePath: string) {
      remove(paths, store, filePath, logger);
    },
  };
}
