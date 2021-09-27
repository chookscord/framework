import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import * as utils from '../../utils';
import type { Config } from '../../types';
import type { Consola } from 'consola';

function validateConfig(config: Config, logger?: Consola) {
  if (!tools.isConfigValid(config, true, logger)) {
    process.exit();
  }
}

export async function loadConfig(
  configFile: string | null,
  logger?: Consola,
): Promise<Config> {
  tools.checkConfigFile(configFile);

  logger?.trace('Loading config file.');
  const inPath = utils.appendPath.fromRoot(configFile);
  const outPath = utils.appendPath
    .fromOut(configFile)
    .replace(/\.ts$/, '.js');

  await tools.compile(inPath, outPath);
  const config = lib.pickDefault(lib.uncachedImport<Config>(outPath));

  logger?.trace('Validating config file.');
  validateConfig(config, logger);
  return config;
}
