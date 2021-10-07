import type { Awaited } from 'discord.js';
import type { ChooksContext } from '@chookscord/types';
import type { Consola } from 'consola';
import { basename } from 'path';

// Duplicated from start/load-files
export type ChooksTeardown = () => unknown;
export type ChooksOnLoad = (ctx: ChooksContext) => Awaited<ChooksTeardown | undefined>;
export type ChooksTeardownList = Map<string, ChooksTeardown | undefined>;

function hasLifecycle(
  mod: Record<string, unknown>,
): mod is { chooksOnLoad: ChooksOnLoad } {
  return 'chooksOnLoad' in mod &&
    typeof mod.chooksOnLoad === 'function';
}

export function teardown(
  filePath: string,
  store: ChooksTeardownList,
  logger?: Consola,
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
  store?: ChooksTeardownList,
  logger?: Consola,
): Promise<void> {
  const mod: Record<string, unknown> = await import(filePath);
  if (hasLifecycle(mod)) {
    const fileName = basename(filePath);
    logger?.debug(`Load "${fileName}".`);
    const cleanup = await mod.chooksOnLoad(ctx);
    store?.set(filePath, cleanup);
  }
}

export function reload(
  ctx: ChooksContext,
  store: ChooksTeardownList,
  filePath: string,
  logger?: Consola,
): void {
  teardown(filePath, store, logger);
  init(ctx, filePath, store, logger);
}
