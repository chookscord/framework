import type { Options, Output } from '@swc/core'
import { transformFile } from '@swc/core'
import fs from 'fs/promises'
import { basename } from 'path'
import type { FileRef } from './file-refs'

const SWC_OPTIONS: Readonly<Options> = {
  module: { type: 'commonjs' },
  jsc: {
    loose: true,
    parser: { syntax: 'typescript' },
    target: 'es2022',
  },
}

export function compile(file: FileRef): Promise<Output> {
  return transformFile(file.target, SWC_OPTIONS)
}

export async function write(file: FileRef, data: string): Promise<void> {
  await fs.mkdir(basename(file.target), { recursive: true })
  await fs.writeFile(file.target, data)
}

export async function unlink(file: FileRef): Promise<void> {
  await fs.unlink(file.target)
}
