/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config';
process.env.NODE_ENV = 'development';
import * as lib from '@chookscord/lib';
import * as path from 'path';
import { Client } from 'discord.js';
import type { Config } from '../../types';
import { ReloadModule } from './modules/_types';
import { appendPath } from './utils';
import { createConfigLoader } from './config';
import { findFiles } from './load-files';

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

export async function run(): Promise<void> {
  await logVersion();
  const [configFile, addedModules] = await findFiles();

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

  const config = await createConfigLoader({
    inputFile: appendPath.fromRoot(configFile),
    outputPath: appendPath.fromOut(),
    onReload: _reload,
  });

  client = createClient(config);

  for (const loadModule of addedModules) {
    const reloadModule = loadModule({ client, config, fetch });
    loadedModules.push(reloadModule);
  }

  logger.info('Client logging in...');
  await client.login();
  logger.success('Client successfully logged in!');
}
