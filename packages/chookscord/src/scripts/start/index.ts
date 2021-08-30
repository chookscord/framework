/* eslint-disable complexity, consistent-return */
import 'dotenv/config';
process.env.NODE_ENV = 'production';
import * as lib from '@chookscord/lib';
import * as modules from './modules';
import * as tools from '../../tools';
import * as utils from '../../utils';
import { Client } from 'discord.js';
import { Config } from '../../types';

const logger = lib.createLogger('[cli] Chooks');
const fetch = lib.fetch;

// Duplicated code again, from scripts/dev
async function findFiles(): Promise<[configFile: string, dirs: string[]]> {
  try {
    const [configFile, dirs] = await tools.findFiles({
      path: utils.appendPath.fromOut(),
      configFiles: ['chooks.config.js'],
      directories: ['commands', 'events'],
    });

    if (!configFile) {
      logger.fatal('Config file does not exist!');
      process.exit();
    }

    return [configFile, dirs];
  } catch (error) {
    logger.fatal(error);
    process.exit();
  }
}

// Duplicated in scripts/register
function validateConfig(config: Config): string | null {
  if (JSON.stringify(config) === '{}') {
    return 'Config file does not have a default export!';
  }

  if (!config.credentials) {
    return 'No credentials found in config!';
  }

  if (!config.credentials.token || !config.credentials.applicationId) {
    return 'Missing credentials!';
  }

  if (!Array.isArray(config.intents)) {
    return 'No intents provided!';
  }

  return null;
}

// Duplicated in scripts/dev
function createclient(config: Config): Client {
  const client = new Client({
    ...config.client?.config,
    intents: config.intents,
  });

  return client;
}

export async function run(): Promise<void> {
  await utils.logVersion(logger);
  logger.info('Starting in production mode...');
  const endTimer = utils.createTimer();

  logger.trace('Finding files.');
  const [configFile, dirs] = await findFiles();

  logger.trace('Loading config.');
  const configPath = utils.appendPath.fromOut(configFile);
  const config = await utils.importDefault<Config>(configPath);

  logger.trace('Validating config.');
  const configError = validateConfig(config);
  if (configError) {
    logger.fatal(new Error(configError));
    process.exit();
  }

  logger.trace('Creating client.');
  const client = createclient(config);

  logger.trace('Loading modules.');
  for (const dir of dirs) {
    if (!(dir in modules)) continue;
    modules[dir as keyof typeof modules].init({
      ctx: { client, config, fetch },
      input: utils.appendPath.fromOut(dir),
    });
  }

  logger.info('Client logging in...');
  await client.login(config.credentials.token);
  logger.success('Client successfully logged in!');
  logger.info(`Startup time: ${endTimer().toLocaleString()}ms`);
}
