import { interopRequireDefault } from '@swc/helpers'
import type { ChooksConfig } from 'chooksie'
import type { Awaitable } from 'discord.js'
import type { Dirent } from 'fs'
import { readdir } from 'fs/promises'
import { join } from 'path'
import type { FileOptions, SourceMap } from '../lib'
import { compile, validateConfig } from '../lib'
import type { WatchCompilerOptions } from './compiler'

export interface ConfigResolverOverrides {
  loader?: (path: string) => Awaitable<ChooksConfig>
  validator?: (config: ChooksConfig) => Awaitable<string | Error | null>
}

const CONFIG_FILES = [
  'chooks.config.js',
  'chooks.config.ts',
  'chooks.config.dev.js',
  'chooks.config.dev.ts',
]

export async function resolveConfigFile(opts: FileOptions, files?: Dirent[]): Promise<SourceMap> {
  const rootFiles = files ?? await readdir(opts.root, { withFileTypes: true })

  const configIndex = rootFiles
    .filter(file => file.isFile())
    .reduce((i, file) => Math.max(i, CONFIG_FILES.indexOf(file.name)), -1)

  if (configIndex < 0) {
    throw new Error('Could not resolve config file!')
  }

  const configFile = CONFIG_FILES[configIndex]
  return {
    source: join(opts.root, configFile),
    target: join(opts.outDir, 'chooks.config.js'),
    type: 'config',
  }
}

export async function resolveConfig(
  opts: FileOptions,
  overrides: WatchCompilerOptions & ConfigResolverOverrides = {},
): Promise<ChooksConfig> {
  const file = await resolveConfigFile(opts)

  const { onChange = compile, onCompile = compile, loader = require } = overrides
  const validator = overrides.validator ?? validateConfig

  const data = await onChange(file)
  await onCompile(file, data.code)

  const config = await loader(file.target) as ChooksConfig
  const error = await validator(config)

  if (error !== null) {
    throw error instanceof Error
      ? error
      : new Error(error)
  }

  return interopRequireDefault(config).default
}
