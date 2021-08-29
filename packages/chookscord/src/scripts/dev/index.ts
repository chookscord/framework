/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config';
process.env.NODE_ENV = 'development';
import * as lib from '@chookscord/lib';
import * as modules from './modules';
import * as path from 'path';
import * as tools from '../../tools';
import * as utils from '../../utils';
import type { ModuleContext, ReloadModule } from './modules/_types';
import { configFiles, createConfigLoader } from './config';
import { Client } from 'discord.js';
import type { Config } from '../../types';

const logger = lib.createLogger('[cli] Chooks');
const fetch = lib.fetch;

async function logVersion(): Promise<void> {
  const packagePath = path.join(__dirname, '..', '..', '..', 'package.json');
  const { name, version } = await import(packagePath);
  logger.info(`Using ${name} v${version}`);
}

function createClient(config: Config): Client {
  const client = new Client({
    ...config.client?.config,
    intents: config.intents,
  });

  return client;
}

function *loadModules(
  ctx: ModuleContext,
  addedModules: string[],
): Iterable<ReloadModule | null> {
  logger.info(`Loading ${addedModules.length} modules...`);
  const endTimer = utils.createTimer();
  for (const moduleName of addedModules) {
    logger.info(`Loading "${moduleName}"...`);
    const loadModule = modules[moduleName as keyof typeof modules];
    const reloadModule = loadModule.init({
      ctx: { ...ctx }, // Respread to avoid mutating other modules
      input: utils.appendPath.fromRoot(moduleName),
      output: utils.appendPath.fromOut(moduleName),
    });
    yield reloadModule;
  }
  logger.success(`Loaded ${addedModules.length} modules. Time took: ${endTimer().toLocaleString()}`);
}

export async function run(): Promise<void> {
  await logVersion();
  logger.info('Starting...');
  const endTimer = utils.createTimer();

  logger.trace('Finding files...');
  const [configFile, addedModules] = await tools.findFiles({
    path: process.cwd(),
    configFiles,
    directories: Object.keys(modules),
  });
  logger.debug(`Config file: "${configFile}"`);
  logger.debug(`Modules loaded: ${addedModules.map(module => `[${module}]`).join(' ')}`);

  if (!configFile) {
    logger.fatal(new Error('Could not find a config file!'));
    process.exit();
  }

  let client: Client;
  const loadedModules: (ReloadModule | null)[] = [];
  const _reload = (config: Config) => {
    // @todo(Choooks22): Detect changes in config relevant for the client
    // and recreate it if necessary.
    for (const reloadModule of loadedModules) {
      reloadModule?.({ client, config, fetch });
    }
  };

  logger.trace('Creating config loader.');
  const config = await createConfigLoader({
    inputFile: utils.appendPath.fromRoot(configFile),
    outputPath: utils.appendPath.fromOut(),
    onReload: _reload,
  });

  logger.trace('Creating client.');
  client = createClient(config);
  const ctx = { client, config, fetch };

  for (const reloadModule of loadModules(ctx, addedModules)) {
    loadedModules.push(reloadModule);
  }

  logger.info('Client logging in...');
  await client.login();
  logger.success('Client successfully logged in!');
  logger.info(`Startup time: ${endTimer().toLocaleString()}ms`);
}
