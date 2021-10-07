/* eslint-disable complexity, consistent-return */
process.env.NODE_ENV = 'production';
import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import * as utils from '../../utils';
import type { ModuleContext, ModuleName } from '../../types';
import { createModuleLoader, loadFiles } from './load-modules';
import { loadConfig } from './load-config';

const logger = lib.createLogger('[cli] Chooks');
const fetch = lib.fetch;

function findFiles() {
  return tools.findProjectFiles(
    lib.loadDir('.chooks'),
    tools.findConfigFile([tools.ConfigFile.JS]),
    () => false,
  );
}

const moduleNames: ModuleName[] = [
  'events',
  'commands',
  'subcommands',
  'contexts',
];
function isModule(name: string): name is ModuleName {
  return moduleNames.includes(name as never);
}

export async function run(): Promise<void> {
  logger.info('Starting in production mode...');
  const endTimer = utils.createTimer();

  logger.trace('Finding files.');
  const [configFile, projectFiles] = await findFiles();

  logger.trace('Loading config.');
  const config = await loadConfig(configFile, logger);

  logger.trace('Creating client.');
  const client = tools.createClient(config);

  logger.trace('Loading modules.');
  const ctx: ModuleContext = { client, config, fetch };
  const loadModule = createModuleLoader(ctx);

  for (const moduleName of projectFiles) {
    if (isModule(moduleName)) {
      loadModule(moduleName);
    } else {
      loadFiles(moduleName);
    }
  }

  logger.info('Client logging in...');
  await client.login(config.credentials.token);
  logger.success('Client successfully logged in!');
  logger.info(`Startup time: ${endTimer().toLocaleString()}ms`);
}
