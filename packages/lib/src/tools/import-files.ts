/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { opendir as _opendir } from 'fs/promises';
import { join } from 'path';

const opendir = async (path: string) => {
  try {
    return await _opendir(path);
  } catch {
    return null;
  }
};

export async function *loadFiles<T>(dirname: string): AsyncGenerator<T> {
  console.debug(`[Loader]: Loading files from "${dirname}"...`);
  const path = join(process.cwd(), dirname);
  const files = await opendir(path);

  if (!files) {
    console.debug('[Loader]: Directory does not exist.');
    return;
  }

  for await (const file of files) {
    if (file.isDirectory()) {
      const dirpath = join(dirname, file.name);
      yield* loadFiles(dirpath);
      continue;
    }

    const filepath = join(path, file.name);
    const data = await uncachedImport<{ default: T }>(filepath);
    console.debug(`[Loader]: Found file "${join(dirname, file.name)}".`);
    yield data.default;
  }
}
