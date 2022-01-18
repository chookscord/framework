import type { Output } from '@swc/core'
import { transformFile } from '@swc/core'
import type { FSWatcher } from 'chokidar'
import EventEmitter from 'events'
import type { Stats } from 'fs'
import fs from 'fs/promises'
import { basename, sep } from 'path'

export type FileType = 'command' | 'subcommand' | 'context' | 'event' | 'script'
export interface File {
  source: string
  target: string
  type: FileType
}

function compile(file: File) {
  return transformFile(file.target)
}

async function write(file: File, data: string) {
  await fs.mkdir(basename(file.target), { recursive: true })
  await fs.writeFile(file.target, data)
}

async function unlink(file: File) {
  await fs.unlink(file.target)
}

const modules: Record<string, FileType> = {
  commands: 'command',
  subcommands: 'subcommand',
  contexts: 'context',
  events: 'event',
}

function getFileType(path: string): FileType {
  const moduleName = path.slice(0, path.indexOf(sep))
  return modules[moduleName] ?? 'script'
}

export interface WatchCompilerOptions {
  root: string
  outDir: string
  onChange?: (file: File) => Output | Promise<Output>
  onCompile?: (file: File, data: string) => void | Promise<void>
  onDelete?: (file: File) => void | Promise<void>
}

export interface CompilerEvents {
  compile: [file: File]
  delete: [file: File]
}

export interface WatchCompiler extends EventEmitter {
  on: <T extends keyof CompilerEvents>(eventName: T, listener: (...args: CompilerEvents[T]) => void) => this
  emit: <T extends keyof CompilerEvents>(eventName: T, ...args: CompilerEvents[T]) => boolean
}

export function createWatchCompiler(
  watcher: FSWatcher,
  opts: WatchCompilerOptions,
): WatchCompiler {
  const events = new EventEmitter() as WatchCompiler
  const { onChange = compile, onCompile = write, onDelete = unlink } = opts

  const toFile = (path: string): File => ({
    source: path,
    target: path
      .replace(opts.root, `${opts.outDir}/`)
      .replace(/\.ts$/, '.js'),
    type: getFileType(path),
  })

  const compileTarget = async (path: string, stats?: Stats) => {
    if (!stats?.isFile()) return

    const file = toFile(path)
    const data = await onChange(file)
    await onCompile(file, data.code)

    events.emit('compile', file)
  }

  const deleteTarget = async (path: string) => {
    const file = toFile(path)
    await onDelete(file)

    events.emit('delete', file)
  }

  watcher.on('add', compileTarget)
  watcher.on('change', compileTarget)

  watcher.on('unlink', deleteTarget)

  return events
}
