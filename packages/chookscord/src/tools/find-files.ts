import * as lib from '@chookscord/lib';

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
