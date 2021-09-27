import * as lib from '@chookscord/lib';
import type { ChooksCommand, ChooksSlashCommand } from '@chookscord/types';
import type { Consola } from 'consola';
import type { Module } from '../load-modules';
import { basename } from 'path';
import { createTimer } from '../../../utils';

type Store = lib.Store<ChooksCommand>;

function isCommandValid(
  command: ChooksSlashCommand,
  logger?: Consola,
): boolean {
  const validationError = lib.validateSlashCommand(command);
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

  const commandFile = await lib.uncachedImport<ChooksSlashCommand>(filePath);
  const command = lib.pickDefault(commandFile);

  if (isCommandValid(command, logger)) {
    store.set(command.name, command);
    paths[fileName] = command.name;
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
