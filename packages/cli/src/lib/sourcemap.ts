import { normalize, sep } from 'path'

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

export function mapSourceFile(opts: FileOptions): (path: string) => SourceMap
export function mapSourceFile(opts: FileOptions, path: string): SourceMap
export function mapSourceFile(opts: FileOptions, path?: string): ((path: string) => SourceMap) | SourceMap {
  const toFileRef = (source: string): SourceMap => ({
    source,
    target: normalize(source.replace(opts.root, `${opts.outDir}/`)).replace(/\.(m|c)?ts$/, '.$1js'),
    type: getFileType(source.slice(opts.root.length + 1)),
  })

  return arguments.length === 2
    ? toFileRef(path!)
    : toFileRef
}
