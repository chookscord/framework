import type { Output } from '@swc/core'
import type { FSWatcher } from 'chokidar'
import type { LoggerFactory } from 'chooksie/internals'
import EventEmitter from 'events'
import type { Stats } from 'fs'
import { resolve } from 'path'
import type { FileOptions, SourceMap } from '../lib/index.js'
import { compile, mapSourceFile, unlink, write } from '../lib/index.js'

export interface WatchCompilerOptions {
  onChange?: (file: SourceMap) => Output | Promise<Output>
  onCompile?: (file: SourceMap, data: string) => void | Promise<void>
  onDelete?: (file: SourceMap) => void | Promise<void>
  createLogger?: LoggerFactory
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
  const logger = opts.createLogger?.('app', 'compiler')
  const { onChange = compile, onCompile = write, onDelete = unlink } = opts

  const toFile = mapSourceFile(opts)

  const compileTarget = async (path: string, stats?: Stats) => {
    if (!stats?.isFile()) return
    const file = toFile(resolve(path))

    try {
      const data = await onChange(file)
      await onCompile(file, data.code)
      events.emit('compile', file)
    } catch (error) {
      logger?.error('Failed to compile file!')
      logger?.error(error)
    }
  }

  const deleteTarget = async (path: string) => {
    const file = toFile(resolve(path))

    try {
      await onDelete(file)
      events.emit('delete', file)
    } catch (error) {
      logger?.error('Failed to delete file!')
      logger?.error(error)
    }
  }

  watcher.on('add', compileTarget)
  watcher.on('change', compileTarget)

  watcher.on('unlink', deleteTarget)

  return events
}
