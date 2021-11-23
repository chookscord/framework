/* eslint-disable @typescript-eslint/no-non-null-assertion, complexity */

/**
 * Traverses a module's children and yields the cache id of each
 * children that contains the target module's id to be unloaded.
 */
function *unloadChildren(
  targetId: string,
  mod: NodeJS.Module,
  visited: Set<string> = new Set(),
): Generator<string, boolean> {
  // should signal to delete the parent
  let deleteSignal = false;

  for (const child of mod.children) {
    if (!child.id.includes('.chooks')) continue;

    // Prevent erroring on circular dependencies
    if (visited.has(child.id)) continue;
    visited.add(child.id);

    if (child.id === targetId) {
      yield child.id;
      deleteSignal = true;
    } else // check if any children references the target module instead
    if (child.children.length) {
      const values = unloadChildren(targetId, child, visited);
      let current = values.next();

      while (!current.done) {
        yield current.value;
        current = values.next();
      }

      deleteSignal ||= current.value;
    }
  }

  if (deleteSignal) {
    yield mod.id;
  }

  return deleteSignal;
}

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

export const uncachedImport: <T>(path: string) => Promise<T> = process.env.MODULE_TYPE === 'esm'
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
