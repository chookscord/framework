import type { Output } from '@swc/core'
import type { FSWatcher } from 'chokidar'
import EventEmitter from 'events'
import type { Stats } from 'fs'
import type { FileOptions, SourceMap } from '../lib'
import { compile, mapSourceFile, unlink, write } from '../lib'

export interface WatchCompilerOptions {
  onChange?: (file: SourceMap) => Output | Promise<Output>
  onCompile?: (file: SourceMap, data: string) => void | Promise<void>
  onDelete?: (file: SourceMap) => void | Promise<void>
}

export interface CompilerEvents {
  compile: [file: SourceMap]
  delete: [file: SourceMap]
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

  const toFile = mapSourceFile(opts)

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
