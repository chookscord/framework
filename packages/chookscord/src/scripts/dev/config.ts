import { createLogger } from '@chookscord/lib';

const logger = createLogger('[cli] Config');

export const configFiles = [
  'chooks.config.dev.ts',
  'chooks.config.dev.js',
  'chooks.config.ts',
  'chooks.config.js',
];

export function loadConfig(configFile: string): void {
  logger.info(`Found config file ${configFile}`);
}
