import * as lib from '@chookscord/lib';
import { basename } from 'path';

const logger = lib.createLogger('[cli] Loader');

export type FoundFiles = [
  configFile: string | null,
  directories: string[],
];

export type FindConfig = (
  file: lib.File,
  current: string | null
) => boolean;

export async function findProjectFiles(
  files: AsyncGenerator<lib.File> | Generator<lib.File>,
  selectConfig: FindConfig,
  excludeFile: (file: lib.File) => boolean,
): Promise<FoundFiles> {
  let config: string | null = null;
  const fileList: string[] = [];

  for await (const file of files) {
    if (selectConfig(file, config)) {
      logger.info(`Found config file "${file.path}".`);
      config = file.path;
    } else if (!excludeFile(file)) {
      logger.info(`Added file "${file.path}".`);
      fileList.push(file.path);
    }
  }

  logger.success(`Selected config file "${config}".`);
  return [config, fileList];
}

export function findConfigFile(
  configFiles: string[],
): FindConfig {
  return (file, current) => {
    if (file.isDirectory) return false;
    const fileName = basename(file.path);

    const fileIndex = configFiles.indexOf(fileName);
    if (fileIndex === -1) return false;
    if (!current) return true;

    const currentFile = basename(current);
    return configFiles.indexOf(currentFile) < fileIndex;
  };
}
