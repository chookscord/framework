import {
  Command,
  CommandStore,
  TextCommand,
  uncachedImport,
} from '@chookscord/lib';
import type { WatchCompiler } from '../../../compilers';
import fs from 'fs/promises';
import { join } from 'path';

async function opendir(path: string) {
  try {
    return await fs.opendir(path);
  } catch {
    return null;
  }
}

export async function loadCommands(
  store: CommandStore,
  commandsDir: string,
  watchCompiler: WatchCompiler,
): Promise<void> {
  // @todo(Choooks22): Extract this from library?
  async function *loadFiles(dirname: string): AsyncGenerator<string> {
    const path = join(process.cwd(), dirname);
    const files = await opendir(path);

    if (!files) {
      return;
    }

    for await (const file of files) {
      if (file.isDirectory()) {
        const dirpath = join(dirname, file.name);
        yield* loadFiles(dirpath);
        continue;
      }

      const filepath = join(dirname, file.name);
      yield filepath;
    }
  }

  for await (const filePath of loadFiles(commandsDir)) {
    watchCompiler.register(filePath, async outPath => {
      const commandPath = join(process.cwd(), outPath);
      const commandFile = await uncachedImport<{ default: Command | TextCommand }>(commandPath);
      const command = commandFile.default;

      if (!command) {
        return;
      }

      const type = 'text' in command && command.text
        ? 'text'
        : 'slash';

      store.remove(type, command.name);
      store.set(command);
    });
  }
}
