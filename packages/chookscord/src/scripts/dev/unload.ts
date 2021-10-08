/* eslint-disable @typescript-eslint/no-non-null-assertion, complexity */

/**
 * Traverses a module's children and yields the cache id of each
 * children that contains the target module's id to be unloaded.
 */
function *unloadChildren(targetId: string, mod: NodeJS.Module): Generator<string, boolean> {
  // should signal to delete the parent
  let deleteSignal = false;

  for (const child of mod.children) {
    if (!child.id.includes('.chooks')) continue;

    if (child.id === targetId) {
      yield child.id;
      deleteSignal = true;
    } else // check if any children references the target module instead
    if (child.children.length) {
      const values = unloadChildren(targetId, child);
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
