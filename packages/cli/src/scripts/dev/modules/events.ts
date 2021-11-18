import { Store, getDefaultImport } from 'chooksie/lib';
import type { ChooksEvent } from 'chooksie/types';
import type { ChooksLogger } from '@chookscord/logger';
import { basename } from 'path';
import { uncachedImport } from '../unload';
import { validateEvent } from '../../../lib';

type EventStore = Store<ChooksEvent>;

function isEventValid(
  event: ChooksEvent,
  logger?: ChooksLogger,
): boolean {
  const validationError = validateEvent(event);
  if (validationError) {
    logger?.error(new Error(validationError));
  }
  return !validationError;
}

export async function update(
  paths: Record<string, string>,
  store: EventStore,
  filePath: string,
  logger?: ChooksLogger,
): Promise<void> {
  const fileName = basename(filePath);
  logger?.info(`"${fileName}" updated.`);

  logger?.debug(`Importing "${fileName}"...`);
  const eventData = await uncachedImport<ChooksEvent>(filePath);
  const event = getDefaultImport(eventData);

  logger?.debug('Import OK. Validating event...');
  if (isEventValid(event)) {
    store.set(event.name, event);
    paths[filePath] = event.name;
    logger?.success(`Event "${event.name}" loaded.`);
  }
}

export function remove(
  paths: Record<string, string>,
  store: EventStore,
  filePath: string,
  logger?: ChooksLogger,
): void {
  const eventName = paths[filePath];
  delete paths[filePath];

  store.delete(eventName);
  logger?.success(`Event "${eventName}" deleted.`);
}

export function createModule(
  store: EventStore,
  logger?: ChooksLogger,
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
