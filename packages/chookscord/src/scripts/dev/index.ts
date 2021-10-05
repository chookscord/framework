process.env.NODE_ENV = 'development';
import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import * as utils from '../../utils';
import type { ModuleName } from '../../types';
import { basename } from 'path';
import { createModuleLoader } from './load-modules';
import { createWatchCompiler } from './compiler';
import { loadConfig } from './load-config';
import { unloadModule } from './unload';

const logger = lib.createLogger('[cli] Chooks');

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
      loadModule(moduleName);
    } else {
      createWatchCompiler({
        root: utils.appendPath.fromRoot(),
        input: moduleName,
        output: `.chooks/${moduleName}`,
        compile(filePath) {
          const fileName = basename(filePath);
          logger.info(`Reload "${fileName}".`);
          unloadModule(filePath);
          delete require.cache[filePath];
        },
      });
    }
  }

  logger.debug('Waiting for login...');
  await login;

  logger.success(`Startup time: ${endTimer().toLocaleString()}ms`);
}
