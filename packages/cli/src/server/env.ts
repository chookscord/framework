import { watch } from 'chokidar'
import dotenv from 'dotenv'
import isEq from 'fast-deep-equal'
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
    const contents = await readFile(filepath)
    return dotenv.parse(contents)
  } catch {
    return {}
  }
}

export async function watchEnv(root: AbsolutePath): Promise<EnvWatcher> {
  const ee = new EventEmitter() as EnvWatcher
  const filepath = resolve(root, '.env') as AbsolutePath

  let prev = await getEnv(filepath)
  Object.assign(process.env, prev)

  const watcher = watch(filepath, {
    cwd: root,
    alwaysStat: true,
  })

  watcher.on('change', async () => {
    const curr = await getEnv(filepath)
    if (!isEq(prev, curr)) {
      prev = curr
      Object.assign(process.env, curr)
      ee.emit('update')
    }
  })

  return ee
}
