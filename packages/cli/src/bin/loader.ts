type Format = 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm';

interface ResolveContext {
  conditions: string[];
  importAssertions: Record<string, unknown>;
  parentURL?: string;
}

interface ResolvedFile {
  format?: Format | null;
  url: string;
}

function isNodeModule(url: URL) {
  return url.protocol === 'nodejs:'
  || url.protocol === 'node:'
  || url.pathname.includes('/node_modules/');
}

export function resolve(
  specifier: string,
  context: ResolveContext,
  defaultResolve: typeof resolve,
): ResolvedFile {
  const result = defaultResolve(specifier, context, defaultResolve);
  const child = new URL(result.url);

  return isNodeModule(child)
    ? result
    : { url: `${child.href}#${Date.now()}` };
}
