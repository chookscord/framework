import type { Config } from '../types';
import { setConfig } from '../cache';
import { uncachedImport } from './import-files';

const importConfig = async (filePath: string): Promise<Config | null> => {
  try {
    const config = await uncachedImport<{ default: Config }>(filePath);
    return config.default;
  } catch {
    return null;
  }
};

export async function loadConfig(filePath: string): Promise<Config | null> {
  console.debug('[Config]: Loading config...');
  const configFile = await importConfig(filePath);
  setConfig(configFile);

  if (configFile) {
    console.debug('[Config]: Config loaded.');
  } else {
    console.warn('[Config]: Config not found!');
  }

  return configFile;
}
