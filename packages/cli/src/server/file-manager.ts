import { ModalHandler, Event, MessageCommand, SlashCommand, SlashSubcommand, UserCommand, ButtonHandler } from 'chooksie'
import { Awaitable, ClientEvents } from 'discord.js'
import { EventEmitter } from 'node:events'
import { relative } from 'path'
import { FileOptions, FileType, SourceMap } from '../lib/index.js'
import { WatchCompiler } from './compiler.js'
import { unrequire } from './require.js'

export type FileEvents = FileCreateEvents & FileDeleteEvents

export interface FileCreateEvents {
  create: [type: FileType, path: string, file: SourceMap]
  commandCreate: [mod: SlashCommand, path: string, file: SourceMap]
  subcommandCreate: [mod: SlashSubcommand, path: string, file: SourceMap]
  userCreate: [mod: UserCommand, path: string, file: SourceMap]
  messageCreate: [mod: MessageCommand, path: string, file: SourceMap]
  eventCreate: [mod: Event<keyof ClientEvents>, path: string, file: SourceMap]
  modalCreate: [modal: ModalHandler, path: string, file: SourceMap]
  buttonCreate: [button: ButtonHandler, path: string, file: SourceMap],
  configCreate: [path: string, file: SourceMap]
  scriptCreate: [path: string, file: SourceMap]
}

export interface FileDeleteEvents {
  delete: [type: FileType, path: string, file: SourceMap]
  commandDelete: [path: string, file: SourceMap]
  subcommandDelete: [path: string, file: SourceMap]
  userDelete: [path: string, file: SourceMap]
  messageDelete: [path: string, file: SourceMap]
  eventDelete: [path: string, file: SourceMap]
  modalDelete: [path: string, file: SourceMap]
  buttonDelete: [path: string, file: SourceMap]
  configDelete: [path: string, file: string]
  scriptDelete: [path: string, file: SourceMap]
}

export interface FileManager extends EventEmitter {
  on: <T extends keyof FileEvents>(eventName: T, listener: (...args: FileEvents[T]) => Awaitable<void>) => this
  emit: <T extends keyof FileEvents>(eventName: T, ...args: FileEvents[T]) => boolean
}

export function createFileManager(
  watcher: WatchCompiler,
  opts: FileOptions,
): FileManager {
  const ee = new EventEmitter() as FileManager

  const onCreate = async (file: SourceMap) => {
    const relpath = relative(opts.root, file.source)
    ee.emit('create', file.type, relpath, file)

    if (file.type === 'script') {
      ee.emit('scriptCreate', relpath, file)
      return
    }

    const eventName = `${file.type}Create` as const
    const mod: { default: never } = await unrequire(file.target)
    ee.emit(eventName, mod.default, relpath, file)
  }

  const onDelete = (file: SourceMap) => {
    const eventName = `${file.type}Delete` as const
    const relpath = relative(opts.root, file.source)
    ee.emit('delete', file.type, relpath, file)
    ee.emit(eventName, relpath, file)
  }

  watcher.on('compile', onCreate)
  watcher.on('delete', onDelete)

  return ee
}
