import type {
  BotCredentials,
  CommandStore,
  EventContext,
  SlashCommand,
} from '../..';
import { createInteractionHandler } from './_handler';
import { createInteractionRegister } from './_register';

export interface InteractionManager {
  load: () => Promise<void>;
  unload: () => Promise<void>;
}

export interface DevStuff extends BotCredentials {
  guildId: string;
}

export function createInteractionManager(
  store: CommandStore<SlashCommand>,
  ctx: EventContext,
  dev?: DevStuff,
): InteractionManager {
  console.debug('[Interaction Manager]: Interaction Manager created.');
  const handler = createInteractionHandler(store, ctx);
  const register = dev
    ? createInteractionRegister(dev, dev.guildId)
    : null;

  return {
    async load() {
      console.info('[Interaction Manager]: Loading commands...');
      handler.register();
      await register?.register(store.toArray());
      console.info(`[Interaction Manager]: ${store.count} commands loaded.`);
    },
    async unload() {
      console.info('[Interaction Manager]: Unloading commands...');
      handler.unregister();
      await register?.unregister();
      console.info('[Interaction Manager]: Commands unloaded.');
    },
  };
}
