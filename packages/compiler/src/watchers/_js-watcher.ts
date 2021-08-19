import { dirname, join } from 'path';
import type { WatchCompiler } from '../_types';
import fs from 'fs/promises';
import { mkdir } from '../_utils';
import { watchFile } from '../_watcher';

async function copy(inPath: string, outPath: string) {
  await mkdir(dirname(outPath));
  await fs.copyFile(inPath, outPath);
}

export function jsCompiler(outDir: string): WatchCompiler {
  console.info('[Compiler]: Using js compiler.');
  const filePaths: string[] = [];

  const emitFile = async (
    path: string,
    onEmit: (outPath: string) => unknown,
  ) => {
    console.debug(`[Compiler]: Emitting ${path}.`);
    const inPath = join(process.cwd(), path);
    const outPath = join(outDir, path);

    await copy(inPath, outPath);
    onEmit(outPath);
  };

  return {
    register(path, onEmit) {
      if (filePaths.includes(path)) {
        return;
      }

      console.info(`[Compiler]: ${path} registered.`);
      filePaths.push(path);
      emitFile(path, onEmit);

      watchFile(
        path,
        () => {
          emitFile(path, onEmit);
        },
      );
    },
  };
}
