import { AbsolutePath, loadSingleModule } from './loader.js'
import { opendir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { ChooksConfig } from 'chooksie'

const configs = [
  'chooks.config.js',
  'chooks.config.ts',
  'chooks.config.dev.js',
  'chooks.config.dev.ts',
]

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

  const mod = await loadSingleModule<{ default: ChooksConfig }>(filepath)
  return mod.default
}
