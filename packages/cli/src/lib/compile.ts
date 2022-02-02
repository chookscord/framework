import type { Options, Output } from '@swc/core'
import { transformFile } from '@swc/core'
import fs from 'fs/promises'
import { dirname } from 'path'
import type { SourceMap } from './sourcemap'

const SWC_OPTIONS: Readonly<Options> = {
  module: { type: 'commonjs' },
  jsc: {
    loose: true,
    parser: { syntax: 'typescript' },
    target: 'es2022',
  },
}

export function compile(file: SourceMap): Promise<Output> {
  return transformFile(file.source, SWC_OPTIONS)
}

export async function write(file: SourceMap, data: string): Promise<void> {
  await fs.mkdir(dirname(file.target), { recursive: true })
  await fs.writeFile(file.target, data)
}

export async function unlink(file: SourceMap): Promise<void> {
  await fs.unlink(file.target)
}
