export {}
declare module 'node:vm' {
  interface ModuleEvaluateOptions {
    timeout?: number
    breakOnSigint?: boolean
  }

  type ModuleStatus =
  | 'unlinked'
  | 'linking'
  | 'linked'
  | 'evaluating'
  | 'evaluated'
  | 'errored'

  interface ModuleAssertion {
    assert: ImportAssertions
  }

  type ModuleLinker = (
    specifier: string,
    referencingModule: Module,
    extra: ModuleAssertion,
  ) => Module | Promise<Module>

  class Module {
    private constructor(): never
    public dependencySpecifiers: string[]
    public error: unknown
    public evaluate(options?: ModuleEvaluateOptions): Promise<void>
    public identifier: string
    public link(linker: ModuleLinker): Promise<void>
    public namespace: Record<string, unknown>
    public status: ModuleStatus
  }

  type ImportMetaInit = (meta: ImportMeta, module: SourceTextModule) => void
  type DynamicImportResolver = (
    specifier: string,
    module: SourceTextModule,
    importAssertions: ImportAssertions
  ) => Awaitable<SourceTextModule>

  interface SourceTextModuleOptions {
    identifier?: string
    cachedData?: Buffer | NodeJS.TypedArray | DataView
    context?: Record<string, unknown>
    lineOffset?: number
    columnOffset?: number
    initializeImportMeta?: ImportMetaInit
    importModuleDynamically?: DynamicImportResolver
  }

  class SourceTextModule extends Module {
    public constructor(code: string, options?: SourceTextModuleOptions)
    public createCachedData(): Buffer
  }
}
