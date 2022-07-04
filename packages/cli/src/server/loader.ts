import swc from '@swc/core'
import { on } from 'node:events'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { EventEmitter } from 'node:stream'
import type { Module } from 'node:vm'
import { SourceTextModule } from 'node:vm'

export type AbsolutePath = string & { __typename: 'AbsolutePath' }
export type Identifier = string & { __typename: 'Identifier' }

export type ModuleContent = string & { __typename: 'ModuleContent' }
export type ModuleCode = string & { __typename: 'ModuleCode' }

export type Linker = (specifier: string, parent: Module) => Promise<SourceTextModule>

export interface ModuleEntry {
  id: Identifier
  contents: ModuleContent
  code: ModuleCode
}

export interface CachedModuleEntry extends ModuleEntry {
  // @Choooks22: we keep track of link promises so sibling child modules
  // can await the same promise
  link: Promise<void>
  dependents: Set<Identifier>
  module: SourceTextModule
}

const tsToJs = (filepath: AbsolutePath) => filepath.replace(/\.ts$/i, '.js')
const jsToTs = (filepath: AbsolutePath) => filepath.replace(/\.js$/i, '.ts')

const swcOptions: swc.Options = {
  module: {
    type: 'es6',
    noInterop: true,
    strict: true,
  },
  jsc: {
    loose: true,
    parser: {
      syntax: 'typescript',
      dynamicImport: true,
    },
    target: 'es2021',
  },
}

async function read(filepath: AbsolutePath): Promise<ModuleContent> {
  try {
    return await readFile(filepath, 'utf-8') as ModuleContent
  } catch {
    return readFile(jsToTs(filepath), 'utf-8') as Promise<ModuleContent>
  }
}

async function transform(contents: ModuleContent): Promise<ModuleCode> {
  const output = await swc.transform(contents, swcOptions)
  return output.code as ModuleCode
}

function setMetaUrl(meta: ImportMeta, mod: SourceTextModule) {
  meta.url = mod.identifier
}

export interface ModuleEvents {
  set: [ns: Record<string, unknown>]
}

const modules = new Map<Identifier, CachedModuleEntry>()

export interface ModuleReadyEvent {
  id: Identifier
  ns: Record<string, unknown>
}

const COMPILE_EVENT = Symbol('CompileEvent')
const compiles = new EventEmitter() as Omit<EventEmitter, 'emit'> & {
  emit: (eventName: typeof COMPILE_EVENT, ev: ModuleReadyEvent) => boolean
}

async function createModule(linker: Linker, data: ModuleEntry) {
  const mod = new SourceTextModule(data.code, {
    identifier: data.id,
    importModuleDynamically: linker,
    initializeImportMeta: setMetaUrl,
  })

  const entry = {
    ...data,
    dependents: new Set(),
    module: mod,
  } as CachedModuleEntry

  // @Choooks22: putting into cache MUST go before linking, so further link()
  // calls can get the same cached entry
  modules.set(data.id, entry)
  entry.link = mod.link(linker)

  await entry.link
  await mod.evaluate()

  compiles.emit(COMPILE_EVENT, {
    id: data.id,
    ns: mod.namespace,
  })

  return entry
}

/**
 * @internal
 */
async function _import(filepath: AbsolutePath, linker: Linker, parentId?: Identifier): Promise<CachedModuleEntry> {
  const id = tsToJs(filepath) as Identifier
  let entry = modules.get(id)

  if (entry === undefined) {
    const contents = await read(filepath)
    const code = await transform(contents)
    entry = await createModule(linker, { id, contents, code })
  }

  if (parentId !== undefined) {
    entry.dependents.add(parentId)
  }

  if (entry.module.status === 'linking') {
    await entry.link
  }

  return entry
}

/**
 * @todo Implement loading node_modules
 * @internal
 */
async function _linker(specifier: string, parent: Module): Promise<SourceTextModule> {
  const parentId = parent.identifier as Identifier
  const base = dirname(parentId)
  const filepath = resolve(base, specifier) as AbsolutePath

  const entry = await _import(filepath, _linker, parentId)
  return entry.module
}

export interface PrunedModule {
  isRoot: boolean
  entry: CachedModuleEntry
}

/**
 * Removes a module and all of its dependents from the dependency tree.
 * @param id The id of the module to prune.
 * @yields The pruned module.
 */
function* pruneModuleFromCache(id: Identifier): Generator<PrunedModule, void> {
  const entry = modules.get(id)
  if (entry === undefined) {
    return
  }

  modules.delete(id)

  const isRoot = entry.dependents.size === 0

  if (isRoot) {
    for (const parentId of entry.dependents) {
      yield* pruneModuleFromCache(parentId)
    }
  }

  yield { isRoot, entry }
}

async function reloadModule(targetId: Identifier): Promise<void> {
  for (const { isRoot, entry } of pruneModuleFromCache(targetId)) {
    if (isRoot) {
      await createModule(_linker, entry)
    }
  }
}

export function unloadModule(id: Identifier): void {
  modules.delete(id)
}

export type LoadStatus = 'cached' | 'reloaded' | 'loaded'
export interface LoadResult<T> {
  status: LoadStatus
  loaded: Iterable<T> | AsyncIterable<T>
}

export async function loadModule(filepath: AbsolutePath): Promise<void> {
  const id = tsToJs(filepath) as Identifier
  const contents = await read(filepath)
  const cached = modules.get(id)

  if (cached !== undefined) {
    if (cached.contents === contents) {
      return
    }

    if (cached.dependents.size > 0) {
      await reloadModule(id)
      return
    }
  }

  const code = await transform(contents)
  await createModule(_linker, { id, contents, code })
}

export async function loadSingleModule<T>(filepath: AbsolutePath): Promise<T> {
  const entry = await _import(filepath, _linker)
  return entry.module.namespace as T
}

export async function* onModuleReady(): AsyncGenerator<ModuleReadyEvent> {
  const events = on<[ModuleReadyEvent]>(compiles, COMPILE_EVENT)
  for await (const [event] of events) {
    yield event
  }
}
