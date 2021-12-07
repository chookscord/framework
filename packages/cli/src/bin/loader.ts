import { EventEmitter } from 'events';
import { URL } from 'url';
// @ts-ignore can't setup proper imports
import { unloadChildren } from '@chookscord/cli/lib';

// eslint-disable-next-line no-var
declare var unloadEventBus: EventEmitter;
globalThis.unloadEventBus ??= new EventEmitter();

const loaded = new Set<string>();
function emit(path: string) {
  if (loaded.has(path)) return;
  loaded.add(path);
  unloadEventBus.emit('unload', path);
  Promise.resolve().then(() => loaded.add(path));
}

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

interface Module {
  id: string;
  children: Module[];
}

const modules: Record<string, Module> = {};

// Replicate structure of require.cache
function cacheModule(childUrl: string, parentUrl: string) {
  const mod = modules[childUrl] ??= {
    id: childUrl,
    children: [],
  };

  if (parentUrl in modules) {
    const parentMod = modules[parentUrl];
    if (!parentMod.children.includes(mod)) {
      parentMod.children.push(mod);
    }
  } else {
    modules[parentUrl] = {
      id: parentUrl,
      children: [mod],
    };
  }
}

function *unload(id: string) {
  const unloadedIds = new Set<string>().add(id);

  for (const key in modules) {
    if (!key.includes('.chooks')) continue;
    const ids = unloadChildren(id, modules[key]);
    for (const cacheId of ids) {
      unloadedIds.add(cacheId);
    }
  }

  yield* unloadedIds.values();
}

export function resolve(
  specifier: string,
  context: ResolveContext,
  defaultResolve: typeof resolve,
): ResolvedFile {
  const result = defaultResolve(specifier, context, defaultResolve);
  const child = new URL(result.url);

  if (context.parentURL && child.href.includes('.chooks')) {
    const parent = new URL(context.parentURL);
    cacheModule(child.pathname, parent.pathname);

    for (const moduleId of unload(child.href)) {
      const path = new URL(moduleId).pathname;
      emit(path);
    }

    return { url: `${child.href}#${Date.now()}` };
  }

  return result;
}
