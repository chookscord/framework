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
  const transpileFile = (filePath: string): Promise<void> => {
    return new Promise(res => {
      watchCompiler.register(filePath, async outPath => {
        const path = join(process.cwd(), outPath);
        const file = await tools.uncachedImport<DefaultExport<T>>(path);
        res(); // Resolve promise only once file has been loaded
        cb(file.default);
      });
    });
  };

  const jobs: Promise<unknown>[] = [];

  for await (const path of tools.traverseDir(rootPath)) {
    const job = transpileFile(path);
    jobs.push(job);
  }

  // This would essentially wait until all files has been
  // transpiled and loaded before continuing
  await Promise.all(jobs);
}
