import type { CommandStore, EventContext, TextCommand } from '../../';
import { createCommandHandler } from './_handler';

export interface CommandManager {
  load: () => void;
  unload: () => void;
}

export function createCommandManager(
  store: CommandStore<TextCommand>,
  ctx: EventContext,
): CommandManager {
  console.debug('[Command Manager]: Command Manager created.');
  const handler = createCommandHandler(store, ctx);

  return {
    load() {
      console.info('[Command Manager]: Loading text commands...');
      handler.register();
      console.info(`[Command Manager]: ${store.count} text commands loaded.`);
    },
    unload(this: CommandManager) {
      console.info('[Command Manager]: Unloading commands...');
      store.clear();
      handler.unregister();
      console.info('[Command Manager]: Commands unloaded.');
    },
  };
}
