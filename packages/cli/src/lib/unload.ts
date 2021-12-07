/* eslint-disable complexity */
interface Module {
  id: string;
  children: Module[];
}

/**
 * Traverses a module's children and yields the cache id of each
 * children that contains the target module's id to be unloaded.
 */
export function *unloadChildren(
  targetId: string,
  mod: Module,
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
