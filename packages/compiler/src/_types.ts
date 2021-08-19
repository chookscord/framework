import type { CompilerOptions } from 'typescript';

export interface WatchCompiler {
  register: (
    path: string,
    onEmit: (outPath: string) => unknown
  ) => void;
}

export interface JsCompiler {
  lang: 'js';
  createCompiler: (outDir: string) => WatchCompiler;
}

export interface TsCompiler {
  lang: 'ts';
  createCompiler: (compileOptions: CompilerOptions) => WatchCompiler;
}
