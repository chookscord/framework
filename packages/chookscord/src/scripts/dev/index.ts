/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config';
process.env.NODE_ENV = 'development';
import * as consola from 'consola';
import * as handlers from './handlers';
import type * as swc from '@swc/core';
import { UpdateListener, createWatchCompiler } from './compiler';
import { basename, join } from 'path';
import { configFiles, loadConfig } from './config';
import { createLogger, loadDir } from '@chookscord/lib';

const logger = createLogger('[cli] Chooks');

const rootOutPath = join(process.cwd(), '.chooks');
const options: Readonly<swc.Options> = {
  jsc: {
    loose: true,
    target: 'es2021',
    externalHelpers: true,
    parser: {
      syntax: 'typescript',
      dynamicImport: true,
    },
  },
  module: {
    type: 'commonjs',
  },
};

// @todo(Choooks22): Improve functionality
function createCompiler(
  dirName: string,
  on?: {
    compile?: UpdateListener;
    delete?: UpdateListener;
  },
): { close: () => void } {
  const close = createWatchCompiler({
    input: join(process.cwd(), dirName),
    output: join(rootOutPath, dirName),
    compilerOptions: options,
    onCompile: on?.compile,
    onDelete: on?.delete,
  });
  return { close };
}

// eslint-disable-next-line complexity
export async function run(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const files = (await loadDir(process.cwd()))!;

  let configFound = false;
  for await (const file of files) {
    const fileName = basename(file.path);

    if (file.isDirectory && fileName in handlers) {
      logger.info(`Found "${fileName}" directory.`);
      const handler = fileName as unknown as keyof typeof handlers;
      createCompiler(fileName, handlers[handler]);
      continue;
    }

    if (configFiles.includes(fileName)) {
      configFound = true;
      loadConfig(fileName);
    }
  }

  if (!configFound) {
    consola.fatal(new Error('Could not find a config file!'));
    process.exit();
  }
}
