import * as lib from '@chookscord/lib';
import * as modules from '../scripts/dev/modules';
import { ModuleContext, ReloadModule } from '../scripts/dev/modules/_types';
import { appendPath } from '../utils';
import { basename } from 'path';
import { configFiles } from '../scripts/dev/config';

const logger = lib.createLogger('[cli] Loader');

type LoadedModule = ((ctx: ModuleContext) => ReloadModule | null);

// eslint-disable-next-line complexity
export async function findFiles(): Promise<[
  configFile: string | null,
  addedModules: LoadedModule[],
]> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const files = (await lib.loadDir(process.cwd()))!;
  const addedModules: LoadedModule[] = [];

  let configFile = Infinity;
  for await (const file of files) {
    const fileName = basename(file.path);

    if (file.isDirectory && fileName in modules) {
      logger.info(`Found "${fileName}" directory.`);
      const initModule: LoadedModule = ctx => {
        const module = modules[fileName as unknown as keyof typeof modules];
        const output = appendPath.fromOut(fileName);
        return module.init({ ctx, input: file.path, output });
      };
      addedModules.push(initModule);
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
  return [configFileName, addedModules];
}
