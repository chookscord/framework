/* eslint-disable complexity, consistent-return */
process.env.NODE_ENV = 'production';
import * as lib from '@chookscord/lib';
import * as modules from './modules';
import * as tools from '../../tools';
import * as utils from '../../utils';
import { Client } from 'discord.js';
import { Config } from '../../types';

const logger = lib.createLogger('[cli] Chooks');
const fetch = lib.fetch;

function findFiles() {
  return tools.findProjectFiles(
    lib.loadDir('.chooks'),
    tools.findConfigFile([tools.ConfigFile.JS]),
    () => false,
  );
}

// Duplicated in scripts/register
function checkConfigFile(fileName: string | null): asserts fileName {
  if (!fileName) {
    logger.fatal(new Error('Missing config file!'));
    process.exit();
  }
}

function validateConfig(config: Config) {
  const validationError = tools.validateConfig(config, false);
  if (validationError) {
    logger.fatal(new Error(validationError));
    process.exit();
  }
}

// Duplicated in scripts/dev
function createClient(config: Config): Client {
  return new Client({
    ...config.client?.config,
    intents: config.intents,
  });
}

export async function run(): Promise<void> {
  logger.info('Starting in production mode...');
  const endTimer = utils.createTimer();

  logger.trace('Finding files.');
  const [configFile, projectFiles] = await findFiles();
  checkConfigFile(configFile);

  logger.trace('Loading config.');
  const configPath = utils.appendPath.fromOut(configFile);
  const config = await utils.importDefault<Config>(configPath);

  logger.trace('Validating config.');
  validateConfig(config);

  logger.trace('Creating client.');
  const client = createClient(config);

  logger.trace('Loading modules.');
  for (const dir of projectFiles) {
    if (!(dir in modules)) continue;
    // @ts-ignore Should extract type and omit unneeded `register` method.
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
