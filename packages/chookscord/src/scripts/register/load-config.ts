import * as tools from '../../tools';
import type { Config } from '../../types';
import type { Consola } from 'consola';
import { appendPath } from '../../utils';
import { pickDefault } from '@chookscord/lib';

function validateConfig(config: Config, logger?: Consola) {
  if (!tools.isConfigValid(config, false, logger)) {
    process.exit();
  }
}

export async function loadConfig(
  configFile: string | null,
  logger?: Consola,
): Promise<Config> {
  tools.checkConfigFile(configFile, logger);

  logger?.trace('Loading config file.');
  const configPath = appendPath.fromOut(configFile);
  const config = pickDefault(await import(configPath) as Config);

  validateConfig(config, logger);
  return config;
}
