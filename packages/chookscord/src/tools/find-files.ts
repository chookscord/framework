import * as lib from '@chookscord/lib';
import { basename } from 'path';
import { configFiles } from '../scripts/dev/config';

const logger = lib.createLogger('[cli] Loader');

interface conf {
  configFiles: string[];
  directories: string[];
}

// eslint-disable-next-line complexity
export async function findFiles(conf: conf): Promise<[
  configFile: string | null,
  directories: string[],
]> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const files = (await lib.loadDir(process.cwd()))!;

  let configFile = Infinity;
  const directories: string[] = [];
  for await (const file of files) {
    const fileName = basename(file.path);

    if (file.isDirectory && conf.directories.includes(fileName)) {
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
