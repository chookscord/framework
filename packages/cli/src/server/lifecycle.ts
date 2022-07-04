import { UnloadEvent } from 'chooksie'
import { genId, hasLifecycle, LoggerFactory } from 'chooksie/internals'
import { Client } from 'discord.js'
import { basename } from 'path'
import { Identifier } from './loader.js'

const scripts = new Map<Identifier, UnloadEvent>()

async function unloadScript(id: Identifier) {
  const cleanup = scripts.get(id)

  if (typeof cleanup === 'function') {
    scripts.delete(id)
    await cleanup()
  }
}

// @todo: abort signals for previous lifecycle
export async function loadScript(
  id: Identifier,
  ns: Record<string, unknown>,
  client: Client<true>,
  pino: LoggerFactory,
): Promise<void> {
  await unloadScript(id)

  if (!hasLifecycle(ns)) {
    return
  }

  const unload = await ns.chooksOnLoad({
    id: genId(),
    client,
    logger: pino('script', basename(id)),
  })

  if (typeof unload === 'function') {
    scripts.set(id, unload)
  }
}
