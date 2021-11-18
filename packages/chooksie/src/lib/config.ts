import type { ChooksLogger } from '@chookscord/logger';

export enum ConfigFile {
  TS = 'chooks.config.ts',
  JS = 'chooks.config.js',
  TSDev = 'chooks.config.dev.ts',
  JSDev = 'chooks.config.dev.js',
}

export function checkConfigFile(
  configFile: string | null,
  logger?: ChooksLogger,
): asserts configFile is string {
  if (!configFile) {
    logger?.fatal(new Error('Missing config file!'));
    process.exit();
  }
}
