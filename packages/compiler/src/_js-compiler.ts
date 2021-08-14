import type { WatchCompiler } from './_types';
import fs from 'fs/promises';
import { join } from 'path';
import { mkdir } from './_utils';
import { watchFile } from './_watcher';

async function copyFile(inPath: string, outPath: string) {
  await fs.copyFile(
    join(process.cwd(), inPath),
    join(process.cwd(), outPath),
  );
}

export function jsCompiler(): WatchCompiler {
  console.info('[Compiler]: Using js compiler.');
  const filePaths: string[] = [];

  const emitFile = async (
    path: string,
    onEmit: (outPath: string) => unknown,
  ) => {
    console.debug(`[Compiler]: Emitting ${path}.`);
    const outPath = join('.chooks', path);

    await mkdir(outPath);
    await copyFile(path, outPath);

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
