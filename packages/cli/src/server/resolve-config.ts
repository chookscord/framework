import { interopRequireDefault } from '@swc/helpers'
import type { ChooksConfig } from 'chooksie'
import type { Awaitable } from 'discord.js'
import type { FileOptions } from '../lib'
import { compile, resolveConfigFile, validateConfig } from '../lib'
import type { WatchCompilerOptions } from './compiler'

export interface ConfigResolverOverrides {
  loader?: (path: string) => Awaitable<ChooksConfig>
  validator?: (config: ChooksConfig) => Awaitable<string | Error | null>
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
