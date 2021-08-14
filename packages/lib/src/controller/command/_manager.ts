import type { CommandStore, EventContext } from '../../';
import { createCommandHandler } from './_handler';

export interface CommandManager {
  load: () => void;
  reload: () => void;
}

export function createCommandManager(
  store: CommandStore<TextCommand>,
  ctx: EventContext,
): CommandManager {
  console.debug('[Command Manager]: Command Manager created.');
  const commandHandler = createCommandHandler(store, ctx);

  const load: CommandManager['load'] = () => {
    console.info('[Command Manager]: Loading text commands...');
    const commands = [...commandStore.getAll('text')];
    commandHandler.register();
    console.info(`[Command Manager]: ${commands.length} text commands loaded.`);
  };

  const reload: CommandManager['reload'] = () => {
    console.info('[Command Manager]: Reloading...');
    commandStore.clear();
    load();
    console.info('[Command Manager]: Reloaded.');
  };

  return {
    load,
    reload,
  };
}
