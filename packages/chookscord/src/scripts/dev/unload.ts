/* eslint-disable @typescript-eslint/no-non-null-assertion, complexity */
function unloadChildren(targetId: string, mod: NodeJS.Module): boolean {
  let unloadParent = false;

  for (const child of mod.children) {
    if (!child.id.includes('.chooks')) continue;

    if (child.id === targetId) {
      delete require.cache[mod.id];
      delete require.cache[child.id];
      unloadParent = true;
    } else // check if any children references the target module instead
    if (child.children.length && unloadChildren(targetId, child)) {
      delete require.cache[mod.id];
      unloadParent = true;
    }
  }

  return unloadParent;
}

export function unloadModule(id: string): void {
  for (const key in require.cache) {
    if (!key.includes('.chooks')) continue;
    unloadChildren(id, require.cache[key]!);
  }
}
