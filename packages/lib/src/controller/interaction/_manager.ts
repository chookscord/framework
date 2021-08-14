import { CommandStore, EventContext } from '../../';
import { createInteractionHandler } from './_handler';
import { createInteractionRegister } from './_register';

export interface InteractionManager {
  load: () => void;
  reload: () => void;
}

export function createInteractionManager(
  ctx: EventContext,
  commandStore: CommandStore,
): InteractionManager {
  console.debug('[Interaction Manager]: Interaction Manager created.');
  const interactionRegister = createInteractionRegister(ctx);
  const interactionHandler = createInteractionHandler(ctx, commandStore);

  const load: InteractionManager['load'] = () => {
    console.info('[Interaction Manager]: Loading commands...');
    const commands = [...commandStore.getAll('slash')];
    interactionRegister.set(commands);
    interactionHandler.register();
    console.info(`[Interaction Manager]: ${commands.length} commands loaded.`);
  };

  const reload: InteractionManager['reload'] = () => {
    console.info('[Interaction Manager]: Reloading...');
    interactionHandler.unregister();
    interactionRegister.clear();
    load();
    console.info('[Interaction Manager]: Reloaded.');
  };

  return {
    load,
    reload,
  };
}
