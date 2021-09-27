import * as lib from '@chookscord/lib';
import type { Consola } from 'consola';
import type { Event } from '../../../types';
import { basename } from 'path';
import { validateEvent } from '../../../tools';

type Store = lib.Store<Event>;

function isEventValid(
  event: Event,
  logger?: Consola,
): boolean {
  const validationError = validateEvent(event);
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
  logger?.info(`"${fileName}" updated.`);

  const event = lib.pickDefault(await lib.uncachedImport<Event>(filePath));
  if (isEventValid(event)) {
    store.set(event.name, event);
    paths[filePath] = event.name;
    logger?.success(`"${event.name}" updated.`);
  }
}

export function remove(
  paths: Record<string, string>,
  store: Store,
  filePath: string,
  logger?: Consola,
): void {
  const eventName = paths[filePath];
  delete paths[filePath];

  store.delete(eventName);
  logger?.success(`Event "${eventName}" deleted.`);
}

export function createModule(
  store: Store,
  logger?: Consola,
): Record<'unlink' | 'compile', (filePath: string) => void | Promise<void>> {
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
