import type { BotCredentials, ChooksConfig } from 'chooksie'
import type { Dirent } from 'fs'
import { readdir } from 'fs/promises'
import Joi from 'joi'
import { join } from 'path'
import type { FileOptions, SourceMap } from './sourcemap'

const CONFIG_FILES = [
  'chooks.config.js',
  'chooks.config.ts',
  'chooks.config.dev.js',
  'chooks.config.dev.ts',
]

const configSchema = Joi.object<ChooksConfig>({
  credentials: Joi.object<BotCredentials>({
    appId: Joi.string(),
    token: Joi.string().required(),
  }).required(),
}).unknown(true)

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object ? DeepPartial<T[P]> : T[P];
}

export function validateConfig(config: DeepPartial<ChooksConfig>): Joi.ValidationError | null {
  return configSchema.validate(config).error ?? null
}

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
