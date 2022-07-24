import type { LifecycleEvents, UnloadEvent } from 'chooksie'
import { createLogger, genId, hasLifecycle } from 'chooksie/internals'
import type { Client } from 'discord.js'
import { basename } from 'path'
import type { Identifier } from './loader.js'

export interface CachedLifecycle {
  ac: AbortController
  ns: Required<LifecycleEvents>
  unload: UnloadEvent | void
}

const lifecycles = new Map<Identifier, CachedLifecycle>()

async function unloadLifecycle(id: Identifier) {
  const lc = lifecycles.get(id)

  if (lc === undefined) {
    return
  }

  lifecycles.delete(id)

  lc.ac.abort()

  if (typeof lc.unload === 'function') {
    await lc.unload()
  }
}

export async function loadLifecycle(
  id: Identifier,
  ns: Record<string, unknown>,
  client: Client<true>,
): Promise<void> {
  await unloadLifecycle(id)

  if (!hasLifecycle(ns)) {
    return
  }

  const ac = new AbortController()
  const unload = await ns.chooksOnLoad({
    id: genId(),
    client,
    logger: createLogger('script', basename(id)),
    signal: ac.signal,
  })

  lifecycles.set(id, { ns, unload, ac })
}
