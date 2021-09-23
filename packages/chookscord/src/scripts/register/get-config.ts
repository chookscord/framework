import * as tools from '../../tools';
import * as utils from '../../utils';
import type { Config } from '../../types';
import type { Logger } from '@chookscord/lib';

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
  const config = await utils.importDefault<Config>(configPath);

  validateConfig(config, options);
  return config;
}
