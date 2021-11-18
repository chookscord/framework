import { isAbsolute, join } from 'path';
import { Dir } from 'fs';
import fs from 'fs/promises';

export type OpenDir = Promise<Dir | null>;
export interface File {
  path: string;
  isDir: boolean;
}

export interface TraverseOptions {
  /** Specify whether to recursively traverse directories. */
  recursive?: boolean;
  /** Pass a custom generator to get files. */
  loader?: (path: string) => Promise<Dir>;
}

/**
 * Traverse a directory and yield each file inside.
 *
 * @param rootPath The absolute path of the directory to traverse.
 * @param options Additional options for traversing.
 */
// eslint-disable-next-line complexity
export async function *traverse(
  rootPath: string,
  options: TraverseOptions = {},
): AsyncGenerator<File> {
  if (!isAbsolute(rootPath)) {
    throw new Error('An absolute path was not provided!');
  }

  const opendir = options.loader ?? fs.opendir;
  const dir = await opendir(rootPath);

  for await (const file of dir) {
    const path = join(rootPath, file.name);
    const isDir = file.isDirectory();

    if (isDir && options.recursive) {
      yield* traverse(path, options);
    }

    yield { path, isDir };
  }
}
