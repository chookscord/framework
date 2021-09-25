/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-var-requires */

// @Choooks22: Not sure how correct this is exactly, or if it overshoots what it's supposed to do.
// Maybe someone could come and clean this up later, and maybe add esm support here, idk
function clearChildren(mod: NodeJS.Module) {
  if (mod.children.length) {
    mod.children.forEach(clearChildren);
  }
  mod.children.splice(0);
}

function removeFromMain(mod: NodeJS.Module) {
  for (const i in require.main?.children as Record<number, NodeJS.Module>) {
    if (require.main?.children[i] === mod) {
      require.main.children.splice(Number(i), 1);
      break;
    }
  }
}

export function uncachedImport<T>(path: string): T {
  const imported = require(path);
  const cacheId = require.resolve(path);
  const mod = require.cache[cacheId]!;

  delete require.cache[cacheId];
  removeFromMain(mod);
  clearChildren(mod);

  return imported;
}

export function uncachedImportDefault<T>(path: string): T {
  const imported = uncachedImport<T | { default: T }>(path);
  return 'default' in imported
    ? imported.default
    : imported;
}
