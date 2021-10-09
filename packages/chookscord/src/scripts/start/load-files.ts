import { createLogger, loadDir } from '@chookscord/lib';
import type { ChooksContext } from '@chookscord/types';
import type { ChooksLifecycle } from '../../types';
import { appendPath } from '../../utils';
import { basename } from 'path';

function hasLifecycle(
  mod: Record<string, unknown>,
): mod is { chooksOnLoad: ChooksLifecycle } {
  return 'chooksOnLoad' in mod &&
    typeof mod.chooksOnLoad === 'function';
}

export async function loadFiles(
  ctx: Omit<ChooksContext, 'logger'>,
  dir: string,
): Promise<void> {
  const path = appendPath.fromOut(dir);
  for await (const file of loadDir(path, { recursive: true })) {
    if (file.isDirectory) continue;
    const fileName = basename(file.path);
    const logger = createLogger(`[file] "${fileName}"`);
    const mod: Record<string, unknown> = await import(file.path);
    if (hasLifecycle(mod)) mod.chooksOnLoad({ ...ctx, logger });
  }
}
