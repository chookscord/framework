import type { Awaited } from 'discord.js';
import type { WatchCompiler } from '@chookscord/compiler';
import { join } from 'path';
import { tools } from '@chookscord/lib';

interface DefaultExport<T> {
  default: T;
}

export async function importFiles<T>(
  watchCompiler: WatchCompiler,
  rootPath: string,
  cb: (data: T) => Awaited<unknown>,
): Promise<void> {
  const transpileFile = (filePath: string): void => {
    watchCompiler.register(filePath, async outPath => {
      const path = join(process.cwd(), outPath);
      const file = await tools.uncachedImport<DefaultExport<T>>(path);
      cb(file.default);
    });
  };

  for await (const path of tools.traverseDir(rootPath)) {
    const filePath = join(process.cwd(), path);
    transpileFile(filePath);
  }
}
