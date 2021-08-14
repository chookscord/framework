import fs from 'fs/promises';
import { join } from 'path/posix';

async function opendir(path: string) {
  try {
    return await fs.opendir(path);
  } catch {
    return null;
  }
}

// @todo(Choooks22): Extract this from library?
export async function *loadFiles(dirname: string): AsyncGenerator<string> {
  const path = join(process.cwd(), dirname);
  const files = await opendir(path);

  if (!files) {
    return;
  }

  for await (const file of files) {
    if (file.isDirectory()) {
      const dirpath = join(dirname, file.name);
      yield* loadFiles(dirpath);
      continue;
    }

    const filepath = join(dirname, file.name);
    yield filepath;
  }
}
