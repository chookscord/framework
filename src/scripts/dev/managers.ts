import * as loader from '../../loaders/commands';
import chooks, {
  CommandManager,
  EventContext,
  EventManager,
  InteractionManager,
} from '@chookscord/lib';


export interface ManagerInterface {
  event: EventManager;
  command: CommandManager;
  interaction: InteractionManager;
  loadEvents: () => Promise<void>;
  loadCommands: () => Promise<void>;
}

export function createManagers(ctx: EventContext): ManagerInterface {
  const commandStore = chooks.createCommandStore();

  const eventManager = chooks.createEventManager(ctx, eventsPath);
  const commandManager = chooks.createCommandManager(ctx, commandStore);
  const interactionManager = chooks.createInteractionManager(ctx, commandStore);

  const loadEvents = async () => {
    await eventManager.load();
  };

  const loadCommands = async () => {
    await loader.loadCommands(commandStore, commandsPath);
    commandManager.load();
    interactionManager.load();
  };

  return {
    event: eventManager,
    command: commandManager,
    interaction: interactionManager,
    loadEvents,
    loadCommands,
  };
}
