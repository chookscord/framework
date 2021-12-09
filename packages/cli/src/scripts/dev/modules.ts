/* eslint-disable @typescript-eslint/no-non-null-assertion, complexity */
import { chooksie, unloadChildren } from '../../lib';

export function *unloadModule(id: string): Generator<string, void, undefined> {
  const unloadedIds = new Set<string>().add(id);

  for (const key in require.cache) {
    if (!key.includes('.chooks')) continue;
    const ids = unloadChildren(id, require.cache[key]!);
    for (const cacheId of ids) {
      delete require.cache[cacheId];
      unloadedIds.add(cacheId);
    }
  }

  delete require.cache[id];
  yield* unloadedIds.values();
}

function removeFromMain(mod: NodeJS.Module) {
  for (const i in require.main?.children as Record<number, NodeJS.Module>) {
    if (require.main?.children[i] === mod) {
      require.main.children.splice(Number(i), 1);
      break;
    }
  }
}

export const uncachedImport: <T>(path: string) => Promise<T> = process.env.MODULE_TYPE === 'module'
  ? path => import(path) // import() will be hooked onto in esm mode
  : async path => {
    await Promise.resolve(); // Avoids race conditions
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const imported = require(path);

    // Grab module from cache
    const cacheId = require.resolve(path);
    const mod = require.cache[cacheId]!;

    // Unload from cache
    delete require.cache[cacheId];
    removeFromMain(mod);

    return imported;
  };

export const cachedImport: <T>(path: string) => Promise<T> = process.env.MODULE_TYPE === 'module'
  ? path => import(path)
  : async path => {
    await Promise.resolve();
    return require(path);
  };

export async function resolveMod<T>(
  path: string,
  resolver = uncachedImport,
): Promise<T> {
  const mod = await resolver<T>(path);
  return chooksie.getDefaultImport(mod);
}
