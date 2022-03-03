import { interopRequireDefault } from '@swc/helpers'

// Exclude unloading files outside the dev dir
function isProjectFile(id: string) {
  return id.includes('.chooks')
}

function* unloadChildren(
  targetId: string,
  mod: NodeJS.Module,
  visited: Set<string> = new Set(),
): Generator<string, boolean> {
  // should signal to delete the parent
  let deleteSignal = false

  for (const child of mod.children) {
    // Prevent erroring on circular dependencies
    if (!isProjectFile(child.id) || visited.has(child.id)) {
      continue
    }

    visited.add(child.id)

    // If we found the target,
    // yield the id and bubble the delete signal up
    if (child.id === targetId) {
      yield child.id
      deleteSignal = true
      continue
    }

    // Else check the children and forward the signal
    if (child.children.length) {
      const values = unloadChildren(targetId, child, visited)
      let current = values.next()

      while (!current.done) {
        yield current.value
        current = values.next()
      }

      deleteSignal ||= current.value
    }
  }

  if (deleteSignal) yield mod.id

  return deleteSignal
}

export function* unloadMod(id: string): Generator<string, void, undefined> {
  const unloadedIds = new Set<string>().add(id)

  for (const key in require.cache) {
    if (!isProjectFile(key)) continue

    const mod = require.cache[key]!
    const ids = unloadChildren(id, mod)

    for (const cacheId of ids) {
      delete require.cache[cacheId]
      unloadedIds.add(cacheId)
    }
  }

  delete require.cache[id]
  yield* unloadedIds.values()
}

export async function unrequire<T>(id: string): Promise<T & { default: T }> {
  await Promise.resolve() // Avoids race conditions

  const cacheId = require.resolve(id)
  const mod = <T>require(cacheId)

  delete require.cache[cacheId]

  return interopRequireDefault(mod)
}
