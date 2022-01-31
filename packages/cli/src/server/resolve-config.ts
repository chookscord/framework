import { interopRequireDefault } from '@swc/helpers'
import type { ChooksConfig } from 'chooksie'
import type { Awaitable } from 'discord.js'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { compile } from '../lib/compile'
import { validateConfig } from '../lib/config'
import type { FileOptions, SourceMap } from '../lib/sourcemap'
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

export async function resolveConfig(
  opts: FileOptions,
  overrides: WatchCompilerOptions & ConfigResolverOverrides = {},
): Promise<ChooksConfig> {
  const { onChange = compile, onCompile = compile, loader = require } = overrides
  const validator = overrides.validator ?? validateConfig
  const rootFiles = await readdir(opts.root, { withFileTypes: true })

  const configIndex = rootFiles
    .filter(file => file.isFile())
    .reduce((i, file) => Math.max(i, CONFIG_FILES.indexOf(file.name)), -1)

  if (configIndex < 0) {
    throw new Error('Could not resolve config file!')
  }

  const configFile = CONFIG_FILES[configIndex]
  const file: SourceMap = {
    source: join(opts.root, configFile),
    target: join(opts.outDir, 'chooks.config.js'),
    type: 'config',
  }

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
