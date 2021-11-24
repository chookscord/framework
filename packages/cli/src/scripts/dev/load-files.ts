import { ChooksContext, ChooksLifecycle, ChooksTeardown } from 'chooksie/types';
import type { ChooksLogger } from '@chookscord/logger';
import { basename } from 'path';

export type ChooksTeardownList = Map<string, ChooksTeardown>;

function hasLifecycle(
  mod: Record<string, unknown>,
): mod is { chooksOnLoad: ChooksLifecycle } {
  return 'chooksOnLoad' in mod &&
    typeof mod.chooksOnLoad === 'function';
}

export function teardown(
  filePath: string,
  store: ChooksTeardownList,
  logger?: ChooksLogger,
): void {
  const cleanup = store.get(filePath);
  if (cleanup) {
    const fileName = basename(filePath);
    logger?.debug(`Teardown "${fileName}".`);
    cleanup();
  }
}

export async function init(
  ctx: ChooksContext,
  filePath: string,
  store: ChooksTeardownList,
  logger?: ChooksLogger,
): Promise<void> {
  const mod: Record<string, unknown> = await import(filePath);
  if (hasLifecycle(mod)) {
    const fileName = basename(filePath);
    logger?.debug(`Load "${fileName}".`);
    const cleanup = await mod.chooksOnLoad(ctx);
    if (cleanup) {
      logger?.debug('Saved teardown function.');
      store.set(filePath, cleanup);
    }
  }
}

export function reload(
  ctx: ChooksContext,
  store: ChooksTeardownList,
  filePath: string,
  logger?: ChooksLogger,
): void {
  teardown(filePath, store, logger);
  init(ctx, filePath, store, logger);
}
