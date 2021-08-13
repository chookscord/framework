import * as chooks from '@chookscord/lib';
import * as loader from './loaders';
import type {
  CommandManager,
  EventContext,
  EventManager,
  InteractionManager,
} from '@chookscord/lib';
import type { WatchCompiler } from '../../compilers';
import { join } from 'path';

export interface ManagerInterface {
  event: EventManager;
  command: CommandManager;
  interaction: InteractionManager;
  loadEvents: () => Promise<void>;
  loadCommands: () => Promise<void>;
}

export function createManagers(
  compiler: WatchCompiler,
  ctx: EventContext,
): ManagerInterface {
  const commandStore = chooks.createCommandStore();

  const eventsPath = join('.chooks', 'events');
  const commandsPath = join('commands');

  const eventManager = chooks.createEventManager(ctx, eventsPath);
  const commandManager = chooks.createCommandManager(ctx, commandStore);
  const interactionManager = chooks.createInteractionManager(ctx, commandStore);

  const loadEvents = async () => {
    await eventManager.load();
  };

  const loadCommands = async () => {
    await loader.loadCommands(commandStore, commandsPath, compiler);
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
