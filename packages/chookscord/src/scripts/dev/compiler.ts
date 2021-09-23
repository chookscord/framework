import * as fs from 'fs/promises';
import * as swc from '@swc/core';
import { FSWatcher, watch } from 'chokidar';
import { Stats, statSync } from 'fs';
import { dirname, join } from 'path';
import { createLogger } from '@chookscord/lib';
import { createTimer } from '../../utils';

export type WriteFile = (outPath: string) => Promise<void>;
export type UpdateListener = (filePath: string) => unknown;

export interface WatchCompilerConfig {
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
  delete?: UpdateListener;
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

async function deleteFile(path: string) {
  await fs.rm(path, { recursive: true, force: true });
}

// @Choooks22: Still feels kinda sus making this a class, rewriting it just exposes methods
// that could be extract to its own functions again, just passing the options as params
export class WatchCompiler {
  protected static _logger = createLogger('[cli] Compiler');
  private _options = this.config.compilerOptions ?? defaultOptions;
  private _watcher: FSWatcher;
  private _isFile: boolean;
  private _paths = {
    in: join(this.config.root, this.config.input),
    out: join(this.config.root, this.config.output),
  };

  // eslint-disable-next-line class-methods-use-this
  private get _logger() {
    return WatchCompiler._logger;
  }

  constructor(private config: WatchCompilerConfig) {
    this._watcher = watch(this._paths.in);
    this._isFile = statSync(this._paths.in).isFile();

    const compile = async (filePath: string, stats?: Stats) => {
      if (!stats?.isFile()) return;
      this._logger.debug('Emit:', filePath);
      const outPath = await this._compile(filePath);
      config.compile?.(outPath);
    };

    const remove = async (filePath: string) => {
      this._logger.debug('Delete:', filePath);
      const outPath = await this._delete(filePath);
      config.delete?.(outPath);
    };

    const watcher = this._watcher;
    watcher.on('add', compile);
    watcher.on('change', compile);

    watcher.on('unlink', remove);
    watcher.on('unlinkDir', remove);
  }

  private _getOutPath(inPath: string): string {
    const path = this._isFile
      ? this._paths.out
      : join(this._paths.out, inPath.slice(this._paths.in.length));

    return path.replace(/\.ts/, '.js');
  }

  private _compileFile(inPath: string): (outPath: string) => Promise<void> {
    const transform = swc.transformFile(inPath, this._options);
    return async outPath => {
      const output = await transform;
      await fs.writeFile(outPath, output.code, 'utf-8');
    };
  }

  private async _compile(filePath: string): Promise<string> {
    const outPath = this._getOutPath(filePath);
    const outDir = dirname(outPath);

    try {
      const endTimer = createTimer();
      this._logger.debug(`Emitting "${filePath}"...`);

      const writeFile = this._compileFile(filePath);
      await mkdir(outDir);
      await writeFile(outPath);

      this._logger.debug(`Emitted file. Time took: ${endTimer().toLocaleString()}ms`);
    } catch (error) {
      this._logger.error(error);
      this._logger.error(`Could not emit file "${filePath}"!`);
    }

    return outPath;
  }

  private async _delete(filePath: string): Promise<string> {
    const outPath = this._getOutPath(filePath);

    try {
      const endTimer = createTimer();
      this._logger.debug(`Deleting "${filePath}"...`);
      await deleteFile(outPath);
      this._logger.debug(`File deleted. Time took: ${endTimer().toLocaleString()}ms`);
    } catch (error) {
      this._logger.error(error);
      this._logger.error(`Failed to delete file "${outPath}"!`);
    }

    return outPath;
  }

  public close(): void {
    this._watcher.close();
  }
}
