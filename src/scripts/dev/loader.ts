import {
  Command,
  CommandStore,
  TextCommand,
  loadFiles,
} from '@chookscord/lib';

export async function loadCommands(
  store: CommandStore,
  commandsDir: string,
): Promise<void> {
  for await (const command of loadFiles(commandsDir)) {
    store.set(command as Command | TextCommand);
  }
}
