import { interopRequireDefault } from '@swc/helpers'
import type { ChooksConfig } from 'chooksie'
import type { Awaitable } from 'discord.js'
import type { FileOptions } from '../lib/index.js'
import { compile, resolveConfigFile, validateConfig, write } from '../lib/index.js'
import type { WatchCompilerOptions } from './compiler.js'

export interface ConfigResolverOverrides {
  loader?: (path: string) => Awaitable<ChooksConfig>
  validator?: (config: ChooksConfig) => Awaitable<string | Error | null>
}

export async function resolveConfig(
  opts: FileOptions,
  overrides: WatchCompilerOptions & ConfigResolverOverrides = {},
): Promise<ChooksConfig> {
  const file = await resolveConfigFile(opts)

  const { onChange = compile, onCompile = write, loader = require } = overrides
  const validator = overrides.validator ?? validateConfig

  const data = await onChange(file)
  await onCompile(file, data.code)

  const config = interopRequireDefault(await loader(file.target) as ChooksConfig).default
  const error = await validator(config)

  if (error !== null) {
    throw error instanceof Error
      ? error
      : new Error(error)
  }

  // Delete token from process env
  for (const key in process.env) {
    const value = process.env[key]
    if (value === config.token) {
      delete process.env[key]
    }
  }

  return config
}
