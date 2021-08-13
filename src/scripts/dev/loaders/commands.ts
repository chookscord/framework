import {
  Command,
  CommandStore,
  TextCommand,
  uncachedImport,
} from '@chookscord/lib';
import type { WatchCompiler } from '../../../compilers';
import { join } from 'path';
import { loadFiles } from './_load-files';

export async function loadCommands(
  store: CommandStore,
  commandsDir: string,
  watchCompiler: WatchCompiler,
): Promise<void> {
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
