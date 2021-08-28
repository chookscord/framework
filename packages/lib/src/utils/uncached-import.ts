export function uncachedImport<T>(path: string): Promise<T> {
  delete require.cache[require.resolve(path)];
  return import(path);
}
