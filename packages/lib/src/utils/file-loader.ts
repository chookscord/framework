import * as fs from 'fs/promises';
import { createLogger } from './logger';
import { join } from 'path';

const logger = createLogger('[lib] Loader');

export interface LoadDirOptions {
  /** Resolve files nested in directories. */
  recursive?: boolean;
  /**
   * Resolve files nested in up to x directories.
   *
   * Ignored when `recursive` is set to true
   */
  depth?: number;
}

async function openDir(path: string) {
  logger.debug('Opening dir:', path);
  try {
    const dir = await fs.opendir(path);
    logger.debug('Dir opened.');
    return dir;
  } catch {
    logger.debug('Could not open dir.');
    return null;
  }
}

export interface File {
  path: string;
  isDirectory: boolean;
}

/**
 * Returns file names from a directory.
 * @param dirPath Absolute path to read files.
 * @returns The absolute path to the file.
 */
// eslint-disable-next-line complexity, consistent-return
export async function *loadDir(
  dirPath: string,
  options?: LoadDirOptions,
): AsyncIterable<File> | Promise<null> {
  logger.debug(`Reading ${dirPath}...`);
  const dir = await openDir(dirPath);

  if (!dir) {
    logger.warn(`${dirPath} does not exist.`);
    return null;
  }

  const recursiveOpts: LoadDirOptions = {
    ...options,
    ...options?.depth
      ? { depth: options.depth - 1 }
      : { },
  };

  for await (const file of dir) {
    logger.debug(`Found file ${file.name}.`);
    const fileData: File = {
      path: join(dirPath, file.name),
      isDirectory: file.isDirectory(),
    };

    yield fileData;
    if (fileData.isDirectory && (options?.recursive || options?.depth)) {
      logger.debug(`Recursing inside directory ${fileData.path}...`);
      yield* loadDir(fileData.path, recursiveOpts);
    }
  }
}
