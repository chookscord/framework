import { ChooksContext, ChooksLifecycle } from 'chooksie/types';
import { ChooksLogger } from '@chookscord/logger';
import { LifecycleStore } from './stores';
import { resolveMod } from './modules';

function hasLifecycle(
  mod: Record<string, unknown>,
): mod is { chooksOnLoad: ChooksLifecycle } {
  return typeof mod.chooksOnLoad === 'function';
}

export async function teardown(
  filePath: string,
  store: LifecycleStore,
  logger: ChooksLogger,
): Promise<void> {
  const cleanup = store.get(filePath);
  if (cleanup) {
    await cleanup();
    logger.debug(`Tore down "${filePath}".`);
  }
}

export async function setup(
  filePath: string,
  store: LifecycleStore,
  ctx: ChooksContext,
  logger: ChooksLogger,
): Promise<void> {
  const mod = await resolveMod<Record<string, unknown>>(filePath);
  logger.debug(`Loaded "${filePath}".`);

  teardown(filePath, store, logger);

  if (!hasLifecycle(mod)) return;
  const cleanup = await mod.chooksOnLoad(ctx);

  if (cleanup) {
    store.set(filePath, cleanup);
    logger.debug('Saved cleanup function.');
  }
}
