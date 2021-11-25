import { Options as SwcOptions, transformFile } from '@swc/core';
import { ExitCode } from './errors';
import { createLogger } from '@chookscord/logger';
import { dirname } from 'path';
import fs from 'fs/promises';

const logger = createLogger('[chooks] compiler');

const defaultOptions: SwcOptions = {
  sourceMaps: false,
  jsc: {
    loose: true,
    parser: {
      syntax: 'typescript',
      dynamicImport: true,
    },
    target: 'es2021',
    externalHelpers: true,
    keepClassNames: true,
  },
  module: {
    strict: true,
    noInterop: true,
    type: process.env.MODULE_TYPE === 'module'
      ? 'es6'
      : 'commonjs',
  },
};

type Options = SwcOptions | ((defaultOption: SwcOptions) => SwcOptions);
const parseOption = (getOption?: Options) => typeof getOption === 'function'
  ? getOption(defaultOptions)
  : getOption ?? defaultOptions;

export async function compileFile(
  filePath: string,
  outFile: string,
  transformCode?: (code: string) => PromiseLike<string> | string,
  options?: Options,
): Promise<void> {
  const transform = transformFile(filePath, parseOption(options));
  await fs.mkdir(dirname(outFile), { recursive: true });

  try {
    const output = await transform;
    const code = typeof transformCode === 'function'
      ? await transformCode(output.code)
      : output.code;

    await fs.writeFile(outFile, code);
  } catch (error) {
    if (error instanceof Error) {
      logger.fatal(error);
    }
    logger.fatal(`Failed to compile file "${filePath}"!`);
    process.exit(ExitCode.BuildFail);
  }
}
