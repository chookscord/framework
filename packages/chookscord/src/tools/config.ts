import * as validate from '@chookscord/validate';
import type { Config } from '../types';
import type { Consola } from 'consola';

export enum ConfigFile {
  TS = 'chooks.config.ts',
  JS = 'chooks.config.js',
  TSDev = 'chooks.config.dev.ts',
  JSDev = 'chooks.config.dev.js',
}

export function getConfigFiles(dev?: false): [
  ConfigFile.TS,
  ConfigFile.JS,
];
export function getConfigFiles(dev: true): [
  ConfigFile.TSDev,
  ConfigFile.JSDev,
  ConfigFile.TS,
  ConfigFile.JS,
];
export function getConfigFiles(dev?: boolean): ConfigFile[] {
  return dev
    ? [
        ConfigFile.TSDev,
        ConfigFile.JSDev,
        ConfigFile.TS,
        ConfigFile.JS,
      ]
    : [
        ConfigFile.TS,
        ConfigFile.JS,
      ];
}

export function checkConfigFile(
  configFile: string | null,
  logger?: Consola,
): asserts configFile is string {
  if (!configFile) {
    logger?.fatal(new Error('Missing config file!'));
    process.exit();
  }
}

export function validateConfig(config: Config, isDev: boolean): validate.ValidationError {
  return validate.assert(
    [config.credentials?.applicationId, config.credentials?.token],
    validate.testEach(
      credential => validate.isType('string', credential) && credential.length
        ? null
        : 'Missing credentials!',
    ),
  ) ??
  validate.assert(
    config.devServer,
    id => {
      if (!isDev) return null;
      return validate.isType('string', id) && id?.length
        ? null
        : 'Missing dev guild id!';
    },
  ) ??
  validate.assert(
    config.intents,
    Array.isArray,
    'Missing client intents!',
  );
}

export function isConfigValid(
  config: Config,
  isDev: boolean,
  logger?: Consola,
): boolean {
  const validationError = validateConfig(config, isDev);
  if (validationError) {
    logger?.fatal(new Error(validationError));
  }
  return !validationError;
}
