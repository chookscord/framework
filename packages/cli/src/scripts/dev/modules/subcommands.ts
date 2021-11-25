import * as lib from '@chookscord/lib';
import type { ChooksCommand, ChooksSubCommand } from '@chookscord/types';
import type { ChooksLogger } from '@chookscord/logger';
import type { Module } from '../load-modules';
import { basename } from 'path';

type Store = lib.Store<ChooksCommand>;

function isCommandValid(
  command: ChooksSubCommand,
  logger?: ChooksLogger,
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
  logger?: ChooksLogger,
): Promise<void> {
  const fileName = basename(filePath);
  const endTimer = utils.createTimer();
  logger?.info(`"${fileName}" updated.`);

  logger?.debug(`Importing "${fileName}"...`);
  const commandData = await lib.uncachedImport<ChooksSubCommand>(filePath);
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
  logger?: ChooksLogger,
): void {
  const commandName = paths[filePath];
  delete paths[filePath];

  store.delete(commandName);
  logger?.success(`Command "${commandName}" deleted.`);
}

export function createModule(
  store: Store,
  logger?: ChooksLogger,
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