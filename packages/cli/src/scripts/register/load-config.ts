import { checkConfigFile, validateProdConfig } from '../../lib';
import type { ChooksConfig } from 'chooksie/types';
import type { ChooksLogger } from '@chookscord/logger';
import { getDefaultImport } from 'chooksie/lib';

export async function loadConfig(
  configFile: string | null,
  logger?: ChooksLogger,
): Promise<ChooksConfig> {
  checkConfigFile(configFile, logger);

  logger?.trace('Loading config file.');
  const config: ChooksConfig = getDefaultImport(await import(configFile));

  validateProdConfig(config);
  return config;
}
