import { JsCompiler, TsCompiler } from './_types';
import { importTs } from './_import-ts';
export * from './_import-ts';
export * from './_types';

async function getJsCompiler(): Promise<JsCompiler> {
  const { jsCompiler } = await import('./_js-compiler');
  return {
    lang: 'js',
    createCompiler: jsCompiler,
  };
}

async function getTsCompiler(ts: typeof import('typescript')): Promise<TsCompiler> {
  const { tsCompiler } = await import('./_ts-compiler');
  return {
    lang: 'ts',
    createCompiler(...args) {
      return tsCompiler(ts, ...args);
    },
  };
}

export async function getCompiler(): Promise<JsCompiler | TsCompiler> {
  const ts = await importTs();
  return ts
    ? getTsCompiler(ts)
    : getJsCompiler();
}
