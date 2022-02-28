import { exec } from 'node:child_process'
import fs from 'node:fs'
import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const run = promisify(exec)
export const stringify = (value: object): string => JSON.stringify(value, null, 2)

export async function mv(oldPath: string, newPath: string): Promise<void> {
  await cp(oldPath, newPath, { recursive: true })
  await rm(oldPath, { recursive: true })
}

export async function toTmp(): Promise<() => void> {
  const cwd = process.cwd()
  const tmp = await mkdtemp(join(tmpdir(), 'create-chooks-bot'))
  process.chdir(tmp)

  return () => {
    process.chdir(cwd)
    fs.rm(tmp, noop)
  }
}
