import type { Output } from '@swc/core'
import type { FSWatcher } from 'chokidar'
import EventEmitter from 'events'
import type { Stats } from 'fs'
import { compile, unlink, write } from '../lib/compile'
import type { FileOptions, FileRef } from '../lib/file-refs'
import { createFileRef } from '../lib/file-refs'

export interface WatchCompilerOptions {
  onChange?: (file: FileRef) => Output | Promise<Output>
  onCompile?: (file: FileRef, data: string) => void | Promise<void>
  onDelete?: (file: FileRef) => void | Promise<void>
}

export interface CompilerEvents {
  compile: [file: FileRef]
  delete: [file: FileRef]
}

export interface WatchCompiler extends EventEmitter {
  on: <T extends keyof CompilerEvents>(eventName: T, listener: (...args: CompilerEvents[T]) => void) => this
  emit: <T extends keyof CompilerEvents>(eventName: T, ...args: CompilerEvents[T]) => boolean
}

export function createWatchCompiler(
  watcher: FSWatcher,
  opts: WatchCompilerOptions & FileOptions,
): WatchCompiler {
  const events = new EventEmitter() as WatchCompiler
  const { onChange = compile, onCompile = write, onDelete = unlink } = opts

  const toFile = createFileRef(opts)

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
