import {
  CommandManager,
  EventContext,
  EventManager,
  InteractionManager,
  createCommandManager,
  createCommandStore,
  createEventManager,
  createInteractionManager,
} from '@chookscord/lib';
import { loadCommands } from './loader';

export interface ManagerInterface {
  event: EventManager;
  command: CommandManager;
  interaction: InteractionManager;
  load: () => Promise<void>;
}

export function createManagers(ctx: EventContext): ManagerInterface {
  const commandStore = createCommandStore();

  const eventManager = createEventManager(ctx, 'events');
  const commandManager = createCommandManager(ctx, commandStore);
  const interactionManager = createInteractionManager(ctx, commandStore);

  const load = async () => {
    await Promise.all([
      eventManager.load(),
      loadCommands(commandStore, 'commands'),
    ]);
    commandManager.load();
    interactionManager.load();
  };

  return {
    event: eventManager,
    command: commandManager,
    interaction: interactionManager,
    load,
  };
}
