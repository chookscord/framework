/* eslint-disable @typescript-eslint/no-non-null-assertion */
process.env.NODE_ENV = 'development';
import * as lib from '@chookscord/lib';
import * as modules from './modules';
import * as tools from '../../tools';
import type * as types from '../../types';
import * as utils from '../../utils';
import { configFiles, createConfigLoader } from './config';
import { Client } from 'discord.js';

const logger = lib.createLogger('[cli] Chooks');
const fetch = lib.fetch;

function createClient(config: types.Config): Client {
  const client = new Client({
    ...config.client?.config,
    intents: config.intents,
  });

  return client;
}

function *loadModules(
  ctx: types.ModuleContext,
  addedModules: (keyof typeof modules.commandModules)[],
  store: lib.Store<lib.SlashCommand>,
): Iterable<Promise<types.ReloadModule> | null> {
  logger.info(`Loading ${addedModules.length} modules...`);
  const endTimer = utils.createTimer();
  for (const moduleName of addedModules) {
    logger.info(`Loading "${moduleName}"...`);

    const config: types.ModuleConfig = {
      ctx: { ...ctx },
      input: utils.appendPath.fromRoot(moduleName),
      output: utils.appendPath.fromOut(moduleName),
    };

    yield (moduleName as string) === 'events'
      ? modules.loadEvents(config)
      : modules.loadCommands(config, moduleName, store);
  }

  logger.success(`Loaded ${addedModules.length} modules. Time took: ${endTimer().toLocaleString()}`);
}

export async function run(): Promise<void> {
  logger.info('Starting...');
  const endTimer = utils.createTimer();

  // @todo(Choooks22): Fix this this is ugly
  logger.trace('Creating commands store...');
  const store = new lib.Store<lib.SlashCommand>('Commands');

  logger.trace('Finding files...');
  const [configFile, addedModules] = await tools.findFiles({
    path: process.cwd(),
    configFiles,
    directories: ['events', ...Object.keys(modules.commandModules)],
  });
  logger.debug(`Config file: "${configFile}"`);
  logger.debug(`Modules loaded: ${addedModules.map(module => `[${module}]`).join(' ')}`);

  if (!configFile) {
    logger.fatal(new Error('Could not find a config file!'));
    process.exit();
  }

  let client: Client;
  const loadedModules: (types.ReloadModule | null)[] = [];
  const _reload = (config: types.Config) => {
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

  // @todo(Choooks22): Cleanup on this part
  for (const reloadModule of loadModules(
    ctx,
    addedModules as (keyof typeof modules.commandModules)[],
    store,
  )) {
    loadedModules.push(await reloadModule);
  }

  logger.info('Client logging in...');
  await client.login(config.credentials.token);
  logger.success('Client successfully logged in!');
  logger.info(`Startup time: ${endTimer().toLocaleString()}ms`);
}
