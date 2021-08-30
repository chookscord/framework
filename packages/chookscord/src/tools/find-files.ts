import * as lib from '@chookscord/lib';
import { basename } from 'path';
import { configFiles } from '../scripts/dev/config';

interface FindFilesConfig {
  path: string;
  configFiles: string[];
  directories: string[];
}

const logger = lib.createLogger('[cli] Loader');

// eslint-disable-next-line complexity
export async function findFiles(config: FindFilesConfig): Promise<[
  configFile: string | null,
  directories: string[],
]> {
  const files = await lib.loadDir(config.path);

  if (!files) {
    throw new Error(`"${config.path}" does not exist!`);
  }

  let configFile = Infinity;
  const directories: string[] = [];
  for await (const file of files) {
    const fileName = basename(file.path);

    if (file.isDirectory && config.directories.includes(fileName)) {
      logger.info(`Found "${fileName}" directory.`);
      directories.push(fileName);
      continue;
    }

    // Select config file based on priority.
    // Lower index = Higher priority.
    if (configFiles.includes(fileName)) {
      logger.info(`Found config file "${fileName}".`);
      configFile = Math.min(configFiles.indexOf(fileName));
    }
  }

  const configFileName = configFiles[configFile] ?? null;
  logger.success(`Selected config file "${configFileName}".`);
  return [configFileName, directories];
}
