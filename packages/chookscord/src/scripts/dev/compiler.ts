import * as fs from 'fs/promises';
import * as swc from '@swc/core';
import { Stats, statSync } from 'fs';
import { basename, dirname, join } from 'path';
import type { Consola } from 'consola';
import type { Logger } from '@chookscord/lib';
import { watch } from 'chokidar';

export type WriteFile = (outPath: string) => Promise<void>;
export type UpdateListener = (filePath: string) => unknown;

export interface WatchCompilerConfig extends Partial<Logger> {
  /**
   * The root absolute path
   */
  root: string;
  /**
   * The path to watch relative from root path
   */
  input: string;
  /**
   * The output path relative from root path
   */
  output: string;
  compilerOptions?: swc.Options;
  compile?: UpdateListener;
  unlink?: UpdateListener;
}

interface Settings {
  getOutPath: (filePath: string) => string;
  listener?: UpdateListener;
  logger?: Consola;
}

const defaultOptions: Readonly<swc.Options> = {
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

async function mkdir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function transformFile(
  filePath: string,
  options: swc.Options = defaultOptions,
): (outPath: string) => Promise<void> {
  const transform = swc.transformFile(filePath, options)
    .catch((error: Error) => error);

  return async outPath => {
    const output = await transform;
    if (output instanceof Error) {
      throw output;
    } else {
      await fs.writeFile(outPath, output.code, 'utf-8');
    }
  };
}

async function compileFile(
  filePath: string,
  outPath: string,
  options?: swc.Options,
): Promise<void> {
  const emit = transformFile(filePath, options);
  await mkdir(dirname(outPath));
  await emit(outPath);
}

async function deleteFile(path: string): Promise<void> {
  await fs.rm(path, { recursive: true, force: true });
}

function createCompile(
  settings: Settings,
  options?: swc.Config,
): (filePath: string, stats?: Stats) => Promise<void> {
  const { getOutPath, logger, listener } = settings;
  return async (filePath, stats) => {
    if (!stats?.isFile()) return;
    logger?.debug('Emit:', filePath);
    const fileName = basename(filePath);
    const outPath = getOutPath(filePath);

    try {
      await compileFile(filePath, outPath, options);
      logger?.success(`Compiled file "${fileName}".`);
      await listener?.(outPath);
    } catch (error) {
      if (error) logger?.error(error);
      logger?.error(`Could not compile file "${filePath}"!`);
    }
  };
}

function createUnlink(
  settings: Settings,
): (filePath: string) => Promise<void> {
  const { getOutPath, logger, listener } = settings;
  return async filePath => {
    logger?.debug('Unlink:', filePath);
    const fileName = basename(filePath);
    const outPath = getOutPath(filePath);

    try {
      await deleteFile(outPath);
      logger?.success(`Deleted file "${fileName}".`);
      await listener?.(outPath);
    } catch (error) {
      if (error) logger?.error(error);
      logger?.error(`Could not delete file "${filePath}"!`);
    }
  };
}

export function createWatchCompiler(
  config: WatchCompilerConfig,
): () => void {
  const { logger, compilerOptions: options } = config;
  const paths = {
    in: join(config.root, config.input),
    out: join(config.root, config.output),
  };
  const isFile = statSync(paths.in).isFile();
  const watcher = watch(paths.in);

  function getOutPath(filePath: string): string {
    const path = isFile
      ? paths.out
      : join(paths.out, filePath.slice(paths.in.length));

    return path.replace(/\.ts$/, '.js');
  }

  function createSettings(listener?: UpdateListener): Settings {
    return { getOutPath, listener, logger };
  }

  const compile = createCompile(createSettings(config.compile), options);
  const unlink = createUnlink(createSettings(config.unlink));

  watcher.on('add', compile);
  watcher.on('change', compile);

  watcher.on('unlink', unlink);
  watcher.on('unlinkDir', unlink);

  return watcher.close;
}
