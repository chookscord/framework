import * as tools from '../../tools';
import * as utils from '../../utils';
import { Logger, pickDefault } from '@chookscord/lib';
import type { Config } from '../../types';

function validateConfig(
  config: Config,
  options: Partial<Logger>,
): void {
  const configError = tools.validateConfig(config, false);
  if (configError) {
    options.logger?.fatal(new Error(configError));
    process.exit();
  }
}

export async function getConfig(
  configFile: string,
  options: Partial<Logger> = {},
): Promise<Config> {
  const configPath = utils.appendPath.fromOut(configFile);
  const config = pickDefault(await import(configPath) as Config);

  validateConfig(config, options);
  return config;
}
