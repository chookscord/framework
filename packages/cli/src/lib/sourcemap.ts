import { join, relative, sep } from 'path'

export type FileType = 'command' | 'subcommand' | 'user' | 'message' | 'event' | 'script' | 'config'
export type SourceDir = 'commands' | 'subcommands' | 'users' | 'messages' | 'events'

export interface SourceMap {
  source: string
  target: string
  type: FileType
}

export interface FileOptions {
  root: string
  outDir: string
}

export const MODULES: Record<SourceDir, FileType> = {
  commands: 'command',
  subcommands: 'subcommand',
  users: 'user',
  messages: 'message',
  events: 'event',
}

export function getFileType(relpath: string): FileType {
  const moduleName = relpath.slice(0, relpath.indexOf(sep))
  return MODULES[moduleName as SourceDir] ?? 'script'
}

function mapSourceFile(opts: FileOptions): (path: string) => SourceMap
function mapSourceFile(opts: FileOptions, path: string): SourceMap
function mapSourceFile(opts: FileOptions, path?: string): ((path: string) => SourceMap) | SourceMap {
  const toFileRef = (source: string): SourceMap => {
    const relpath = relative(opts.root, source)
    return {
      source,
      target: join(opts.outDir, relpath).replace(/\.(m|c)?ts$/, '.$1js'),
      type: getFileType(relpath),
    }
  }

  return arguments.length === 2
    ? toFileRef(path!)
    : toFileRef
}

function sourceFromFile(opts: FileOptions): (path: string) => SourceMap
function sourceFromFile(opts: FileOptions, path: string): SourceMap
function sourceFromFile(opts: FileOptions, path?: string): ((path: string) => SourceMap) | SourceMap {
  const fromFileRef = (target: string): SourceMap => {
    const relpath = relative(opts.outDir, target)
    return {
      source: join(opts.root, relpath),
      target,
      type: getFileType(relpath),
    }
  }

  return arguments.length === 2
    ? fromFileRef(path!)
    : fromFileRef
}

export { mapSourceFile, sourceFromFile }
