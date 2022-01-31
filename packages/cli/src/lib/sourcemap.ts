import { sep } from 'path'

export type FileType = 'command' | 'subcommand' | 'context' | 'event' | 'script' | 'config'
export interface SourceMap {
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

export function mapSourceFile(opts: FileOptions): (path: string) => SourceMap
export function mapSourceFile(opts: FileOptions, path: string): SourceMap
export function mapSourceFile(opts: FileOptions, path?: string): ((path: string) => SourceMap) | SourceMap {
  const toFileRef = (source: string): SourceMap => ({
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
