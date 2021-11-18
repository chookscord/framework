/* eslint-disable no-trailing-spaces */
import { File, getDefaultImport } from 'chooksie/lib';
import { basename, join } from 'path';
import type { ChooksConfig } from 'chooksie';
import type { ChooksLogger } from '@chookscord/logger';
import type { ValidationResult } from './validation/tests';
import { compileFile } from './compile';

export enum ConfigFile {
  TS = 'chooks.config.ts',
  JS = 'chooks.config.js',
  TSDev = 'chooks.config.dev.ts',
  JSDev = 'chooks.config.dev.js',
}

/**
 * Select and prioritize config file names.  
 * Higher index = Higher priority.
 */
export function selectConfig(
  configFiles: ConfigFile[],
  current: ConfigFile | null,
  fileName: ConfigFile,
): boolean {
  if (!configFiles.includes(fileName)) return false;
  if (current === null) return true;

  const newFile = configFiles.indexOf(fileName);
  const oldFile = configFiles.indexOf(current);
  return newFile > oldFile;
}

/**
 * Utility to check and exit if config file is null.
 */
export function checkConfigFile(
  configFile: string | null,
  logger?: ChooksLogger,
): asserts configFile is string {
  if (!configFile) {
    logger?.fatal(new Error('Missing config file!'));
    process.exit();
  }
}

/**
 * Validate and log a config file given a validator function.
 */
export function isConfigValid(
  config: ChooksConfig,
  validateConfig: (config: ChooksConfig) => ValidationResult,
  logger?: ChooksLogger,
): boolean {
  const validationError = validateConfig(config);
  if (validationError) {
    logger?.fatal(new Error(validationError));
  }
  return !validationError;
}

/**
 * Find and validate config file.
 */
export async function resolveConfig(
  configNames: ConfigFile[],
  files: Iterable<File> | AsyncIterable<File>,
  logger?: ChooksLogger,
): Promise<ChooksConfig> {
  let currentFile: string | null = null;
  for await (const file of files) {
    const fileName = basename(file.path) as ConfigFile;
    const current = currentFile
      ? basename(currentFile) as ConfigFile
      : null;

    if (selectConfig(configNames, current, fileName)) {
      currentFile = file.path;
    }
  }

  checkConfigFile(currentFile, logger);
  const path = join(process.cwd(), '.chooks', currentFile.slice(process.cwd().length).replace(/\.ts$/, '.js'));
  console.log('config path', path);
  await compileFile(currentFile, path);

  const configFile = await import(path);
  return getDefaultImport(configFile);
}
