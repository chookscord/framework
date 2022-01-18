import { interopRequireDefault } from '@swc/helpers'
import { readdir } from 'fs/promises'
import { join } from 'path'
import type { WatchCompilerOptions } from './compiler'
import { compile } from '../lib/compile'
import type { FileOptions, FileRef } from '../lib/file-refs'

export interface BotCredentials {
  token: string
  appId: string
}

export interface ChooksConfig {
  credentials: BotCredentials
}

export interface ConfigResolverOverrides {
  loader?: (path: string) => ChooksConfig
}

const CONFIG_FILES = [
  'chooks.config.js',
  'chooks.config.ts',
  'chooks.config.dev.js',
  'chooks.config.dev.ts',
]

export async function resolveConfig(
  opts: FileOptions,
  overrides: WatchCompilerOptions & ConfigResolverOverrides = {},
): Promise<ChooksConfig> {
  const { onChange = compile, onCompile = compile, loader = require } = overrides
  const rootFiles = await readdir(opts.root, { withFileTypes: true })

  const configIndex = rootFiles
    .filter(file => file.isFile())
    .reduce((i, file) => Math.max(i, CONFIG_FILES.indexOf(file.name)), -1)

  if (configIndex < 0) {
    throw new Error('Could not resolve config file!')
  }

  const configFile = CONFIG_FILES[configIndex]
  const file: FileRef = {
    source: join(opts.root, configFile),
    target: join(opts.outDir, 'chooks.config.js'),
    type: 'config',
  }

  const data = await onChange(file)
  await onCompile(file, data.code)

  return interopRequireDefault(<ChooksConfig>loader(file.target)).default
}
