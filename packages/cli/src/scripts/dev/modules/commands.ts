import type { ChooksCommand, ChooksSlashCommand } from 'chooksie/types';
import { Store, chrono, getDefaultImport } from 'chooksie/lib';
import type { ChooksLogger } from '@chookscord/logger';
import type { Module } from '../load-modules';
import { basename } from 'path';
import { uncachedImport } from '../unload';
import { validateSlashCommand } from '../../../lib';

type CommandStore = Store<ChooksCommand>;

function isCommandValid(
  command: ChooksSlashCommand,
  logger?: ChooksLogger,
): boolean {
  const validationError = validateSlashCommand(command);
  if (validationError) {
    logger?.error(new Error(validationError));
  }
  return !validationError;
}

export async function update(
  paths: Record<string, string>,
  store: CommandStore,
  filePath: string,
  logger?: ChooksLogger,
): Promise<void> {
  const fileName = basename(filePath);
  const endTimer = chrono.createTimer();
  logger?.info(`"${fileName}" updated.`);

  logger?.debug(`Importing "${fileName}"...`);
  const commandData = await uncachedImport<ChooksSlashCommand>(filePath);
  const command = getDefaultImport(commandData);

  logger?.debug('Import OK. Validating command...');
  if (isCommandValid(command, logger)) {
    store.set(command.name, command);
    paths[fileName] = command.name;
    logger?.success(`Command "${command.name}" loaded. Time took: ${endTimer().toLocaleString()}ms`);
  }
}

export function remove(
  paths: Record<string, string>,
  store: CommandStore,
  filePath: string,
  logger?: ChooksLogger,
): void {
  const commandName = paths[filePath];
  delete paths[filePath];

  store.delete(commandName);
  logger?.success(`Command "${commandName}" deleted.`);
}

export function createModule(
  store: CommandStore,
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
