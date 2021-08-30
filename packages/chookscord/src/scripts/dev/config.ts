import * as consola from 'consola';
import * as utils from '../../utils';
import type { Config } from '../../types';
import { createLogger } from '@chookscord/lib';
import { createWatchCompiler } from './compiler';

const logger = createLogger('[cli] Config');

export const configFiles = [
  'chooks.config.dev.ts',
  'chooks.config.dev.js',
  'chooks.config.ts',
  'chooks.config.js',
];

interface ConfigWatcherOpts {
  inputFile: string;
  outputPath: string;
  onReload: (config: Config) => unknown;
}

export function createConfigLoader(opts: ConfigWatcherOpts): Promise<Config> {
  const importConfig = async (filePath: string): Promise<Config> => {
    logger.info('Loading config...');
    const config = await utils.uncachedImportDefault<Config>(filePath);

    if (!config) {
      const invalidExport = 'Config file does not have a default export!';
      consola.fatal(new Error(invalidExport));
      process.exit();
    }

    if (typeof config !== 'object' || Array.isArray(config)) {
      const invalidConfig = 'Config file must be an object!';
      consola.fatal(new Error(invalidConfig));
      process.exit();
    }

    logger.success('Loaded config file.');
    return config;
  };

  return new Promise(res => {
    createWatchCompiler({
      input: opts.inputFile,
      output: opts.outputPath,
      async onCompile(filePath) {
        const config = await importConfig(filePath);
        opts.onReload(config);
        res(config);
      },
    });
  });
}
