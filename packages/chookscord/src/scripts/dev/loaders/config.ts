import * as lib from '@chookscord/lib';
import * as tools from '../../../tools';
import type * as types from '../../../types';
import * as utils from '../../../utils';

const logger = lib.createLogger('[cli] Config');

function checkConfigFile(configFile: string | null): asserts configFile is string {
  if (!configFile) {
    logger.fatal(new Error('No config file found!'));
    process.exit();
  }
}

function validateConfig(config: types.Config) {
  const validationError = tools.validateConfig(config, false);
  if (validationError) {
    logger.fatal(new Error(validationError));
    process.exit();
  }
}

export async function loadConfig(configFile: string | null): Promise<types.Config> {
  logger.trace('Checking config file.');
  checkConfigFile(configFile);

  logger.trace('Loading config file.');
  const inPath = utils.appendPath.fromRoot(configFile);
  const outPath = utils.appendPath
    .fromOut(configFile)
    .replace(/\.ts$/, '.js');

  await tools.compile(inPath, outPath);
  const config = lib.pickDefault(lib.uncachedImport<types.Config>(outPath));

  logger.trace('Validating config file.');
  validateConfig(config);
  return config;
}
