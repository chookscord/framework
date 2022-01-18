import { sep } from 'path'

export type FileType = 'command' | 'subcommand' | 'context' | 'event' | 'script' | 'config'
export interface FileRef {
  source: string
  target: string
  type: FileType
}

export interface FileOptions {
  root: string
  outDir: string
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

export function createFileRef(opts: FileOptions): (path: string) => FileRef
export function createFileRef(opts: FileOptions, path: string): FileRef
export function createFileRef(opts: FileOptions, path?: string): ((path: string) => FileRef) | FileRef {
  const toFileRef = (source: string): FileRef => ({
    source,
    target: source
      .replace(opts.root, `${opts.outDir}/`)
      .replace(/\.ts$/, '.js'),
    type: getFileType(source),
  })

  return arguments.length === 2
    ? toFileRef(path!)
    : toFileRef
}
