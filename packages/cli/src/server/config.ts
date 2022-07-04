import { watch } from 'chokidar'
import type { ChooksConfig } from 'chooksie'
import isEq from 'fast-deep-equal'
import { EventEmitter } from 'node:events'
import { opendir } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { AbsolutePath } from './loader.js'
import { loadSingleModule, unloadModule } from './loader.js'

const configs = [
  'chooks.config.js',
  'chooks.config.ts',
  'chooks.config.dev.js',
  'chooks.config.dev.ts',
]

export interface ConfigWatcherEvents {
  update: [config: ChooksConfig]
}

export interface ConfigWatcher extends EventEmitter {
  on: <T extends keyof ConfigWatcherEvents>(eventName: T, listener: (...args: ConfigWatcherEvents[T]) => void) => this
  once: <T extends keyof ConfigWatcherEvents>(eventName: T, listener: (...args: ConfigWatcherEvents[T]) => void) => this
  emit: <T extends keyof ConfigWatcherEvents>(eventName: T, ...args: ConfigWatcherEvents[T]) => boolean
}

// @todo: validation
export async function resolveConfig(root: AbsolutePath): Promise<ChooksConfig> {
  let config = -1
  const files = await opendir(root)

  for await (const file of files) {
    if (file.isDirectory()) {
      continue
    }

    const priority = configs.indexOf(file.name)
    config = Math.max(config, priority)
  }

  if (config === -1) {
    throw new Error('No config found!')
  }

  const filename = configs[config]
  const filepath = resolve(root, filename) as AbsolutePath

  unloadModule(filepath)
  const mod = await loadSingleModule<{ default: ChooksConfig }>(filepath)
  return mod.default
}

export async function configWatcher(root: AbsolutePath): Promise<ConfigWatcher> {
  const ee = new EventEmitter() as ConfigWatcher
  const filepaths = configs.map(config => resolve(root, config))

  const watcher = watch(filepaths, {
    cwd: root,
    alwaysStat: true,
  })

  let prev = await resolveConfig(root)

  watcher.on('change', async () => {
    const curr = await resolveConfig(root)
    if (!isEq(prev, curr)) {
      prev = curr
      ee.emit('update', curr)
    }
  })

  return ee
}
