import fs from 'fs/promises';
import { join } from 'path';

async function opendir(path: string) {
  try {
    return await fs.opendir(path);
  } catch {
    return null;
  }
}

export async function *traverseDir(rootDir: string): AsyncGenerator<string> {
  const path = join(process.cwd(), rootDir);
  const files = await opendir(path);

  if (!files) {
    return;
  }

  for await (const file of files) {
    if (file.isDirectory()) {
      const dirPath = join(rootDir, file.name);
      yield* traverseDir(dirPath);
      continue;
    }

    const filepath = join(rootDir, file.name);
    yield filepath;
  }
}
