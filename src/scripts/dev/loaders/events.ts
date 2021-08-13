import { WatchCompiler } from '../../../compilers';
import { loadFiles } from './_load-files';

export async function loadEvents(
  eventsDir: string,
  watchCompiler: WatchCompiler,
): Promise<void> {
  for await (const filePath of loadFiles(eventsDir)) {
    watchCompiler.register(filePath, () => {
      // Events handled by events manager
    });
  }
}
