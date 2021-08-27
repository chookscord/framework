import * as fs from 'fs/promises';
import * as swc from '@swc/core';
import { dirname, join } from 'path';
import { Stats } from 'fs';
import { createLogger } from '@chookscord/lib';
import { watch } from 'chokidar';

export type WriteFile = (outPath: string) => Promise<void>;
export type UpdateListener = (filePath: string) => unknown;

export interface WatchCompilerConfig {
  input: string;
  output: string;
  compilerOptions: swc.Options;
  onCompile?: UpdateListener;
  onDelete?: UpdateListener;
}

const logger = createLogger('[cli] Compiler');

function isFile(stats: Stats): boolean {
  return stats.isFile() && !stats.isDirectory();
}

function compileFile(
  filePath: string,
  options: swc.Options,
): WriteFile {
  const transform = swc.transformFile(filePath, options);
  return async outPath => {
    const output = await transform;
    await fs.writeFile(outPath, output.code, 'utf-8');
  };
}

export function createWatchCompiler(config: WatchCompilerConfig): () => void {
  const watcher = watch(config.input);

  logger.info(`Watching "${config.input}".`);

  const _getPaths = (filePath: string): [inPath: string, outPath: string] => {
    const inPath = filePath.slice(config.input.length + 1);
    const outPath = join(config.output, inPath).replace(/\.ts$/, '.js');
    return [inPath, outPath];
  };

  const _compile = async (filePath: string): Promise<void> => {
    const [inPath, outPath] = _getPaths(filePath);

    try {
      const writeFile = compileFile(filePath, config.compilerOptions);
      await fs.mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath);
      logger.success(`Emit "${inPath}".`);
      config.onCompile?.(outPath);
    } catch (error) {
      logger.error(`Failed to emit "${inPath}"!`);
      logger.error(error);
    }
  };

  const _delete = async (filePath: string): Promise<void> => {
    const [inPath, outPath] = _getPaths(filePath);

    try {
      await fs.rm(outPath, { recursive: true, force: true });
      logger.success(`Delete "${inPath}".`);
      config.onDelete?.(outPath);
    } catch (error) {
      logger.error(`Failed to delete "${inPath}"!`);
      logger.error(error);
    }
  };

  const onUpdate = (path: string, stats?: Stats) => {
    logger.trace('Update:', path);
    if (!stats || !isFile(stats)) return;
    _compile(path);
  };

  const onRemove = (path: string) => {
    logger.trace('Remove:', path);
    _delete(path);
  };

  watcher.on('add', onUpdate);
  watcher.on('change', onUpdate);

  watcher.on('unlink', onRemove);
  watcher.on('unlinkDir', onRemove);

  return watcher.close;
}
