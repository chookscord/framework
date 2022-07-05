import { watch } from 'chokidar'
import dotenv from 'dotenv'
import { EventEmitter } from 'node:events'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { AbsolutePath } from './loader.js'

export interface EnvWatcherEvents {
  update: []
}

export interface EnvWatcher extends EventEmitter {
  on: <T extends keyof EnvWatcherEvents>(eventName: T, listener: (...args: EnvWatcherEvents[T]) => void) => this
  once: <T extends keyof EnvWatcherEvents>(eventName: T, listener: (...args: EnvWatcherEvents[T]) => void) => this
  emit: <T extends keyof EnvWatcherEvents>(eventName: T) => boolean
}

async function getEnv(filepath: AbsolutePath) {
  try {
    return await readFile(filepath)
  } catch {
    return Buffer.alloc(0)
  }
}

function setEnv(buf: Buffer) {
  const env = dotenv.parse(buf)
  Object.assign(process.env, env)
}

export async function loadEnv(filepath: AbsolutePath): Promise<Buffer> {
  const buf = await getEnv(filepath)
  setEnv(buf)
  return buf
}

export async function watchEnv(root: AbsolutePath, init?: Buffer): Promise<EnvWatcher> {
  const ee = new EventEmitter() as EnvWatcher
  const filepath = resolve(root, '.env') as AbsolutePath

  let prev = init ?? await loadEnv(filepath)

  const watcher = watch(filepath, {
    cwd: root,
    alwaysStat: true,
  })

  watcher.on('change', async () => {
    const curr = await getEnv(filepath)
    if (!curr.equals(prev)) {
      prev = curr
      setEnv(curr)
      ee.emit('update')
    }
  })

  return ee
}
