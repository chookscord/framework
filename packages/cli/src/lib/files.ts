import type { ChooksLogger } from '@chookscord/logger';
import type { ConfigFile } from './config';
import type { File } from 'chooksie/lib';
import { basename } from 'path';
import { chooksie } from './index';

interface ProjectOptions {
  rootPath: string;
  includeFile: (file: File) => boolean;
  pickConfig: (current: ConfigFile | null, fileName: ConfigFile) => boolean;
}

// eslint-disable-next-line complexity
export async function getProjectFiles(
  project: ProjectOptions,
  logger?: ChooksLogger,
): Promise<[string | null, string[]]> {
  const { rootPath, includeFile, pickConfig } = project;
  let configFile: ConfigFile | null = null;
  const files: string[] = [];
  const getConfig = () => configFile && basename(configFile) as ConfigFile;

  for await (const file of chooksie.traverse(rootPath)) {
    const fileName = basename(file.path);
    if (!file.isDir && pickConfig(getConfig(), fileName as ConfigFile)) {
      configFile = file.path as ConfigFile;
      continue;
    }

    if (includeFile(file)) {
      logger?.debug(`Including "${basename(file.path)}".`);
      files.push(file.path);
    }
  }

  return [configFile, files];
}
