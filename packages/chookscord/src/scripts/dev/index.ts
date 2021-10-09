process.env.NODE_ENV = 'development';
import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import * as utils from '../../utils';
import { ChooksTeardownList, reload } from './load-files';
import type { ChooksContext } from '@chookscord/types';
import type { Client } from 'discord.js';
import type { ModuleName } from '../../types';
import { basename } from 'path';
import { createModuleLoader } from './load-modules';
import { createWatchCompiler } from './compiler';
import { loadConfig } from './load-config';
import { unloadModule } from './unload';

const logger = lib.createLogger('[cli] Chooks');
const store: ChooksTeardownList = new Map();

function reloadFile(client: Client, filePath: string) {
  const fileName = basename(filePath);
  const ctx: ChooksContext = {
    client,
    fetch: lib.fetch,
    logger: lib.createLogger(`[file] ${fileName}`),
  };
  reload(ctx, store, filePath, logger);
}

function loadDir(client: Client, dirName: string) {
  createWatchCompiler({
    logger,
    root: utils.appendPath.fromRoot(),
    input: dirName,
    output: `.chooks/${dirName}`,
    compile(filePath) {
      for (const cacheId of unloadModule(filePath)) {
        reloadFile(client, cacheId);
      }
    },
  });
}

function findFiles() {
  return tools.findProjectFiles(
    lib.loadDir('.'),
    tools.findConfigFile(tools.getConfigFiles(true)),
    file => !file.isDirectory || /^(\..*|node_modules$)/.test(file.path),
  );
}

const modules: ModuleName[] = [
  'events',
  'commands',
  'subcommands',
  'contexts',
];
function isModule(moduleName: string): moduleName is ModuleName {
  return modules.includes(moduleName as never);
}

export async function run(): Promise<void> {
  const endTimer = utils.createTimer();
  logger.info('Starting...');

  logger.trace('Loading files...');
  const [configFile, projectFiles] = await findFiles();

  logger.trace('Loading config...');
  const config = await loadConfig(configFile);

  logger.trace('Creating client...');
  const client = tools.createClient(config);
  const login = client.login(config.credentials.token);

  logger.trace('Loading modules...');
  const loadModule = createModuleLoader(client, config);

  for (const moduleName of projectFiles) {
    if (isModule(moduleName)) {
      logger.debug(`Module "${moduleName}" loaded.`);
      loadModule(moduleName);
    } else {
      logger.debug(`Local dir "${moduleName}" loaded.`);
      loadDir(client, moduleName);
    }
  }

  logger.debug('Waiting for login...');
  await login;

  logger.success(`Startup time: ${endTimer().toLocaleString()}ms`);
}
