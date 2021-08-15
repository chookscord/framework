import * as chooks from '@chookscord/lib';
import * as loader from './load-files';
import type { WatchCompiler } from '@chookscord/compiler';

export interface ManagerInterface {
  event: chooks.EventManager;
  command: chooks.CommandManager;
  interaction: chooks.InteractionManager;
  loadEvents: () => Promise<void>;
  loadCommands: () => Promise<void>;
}

export function createManagers(
  compiler: WatchCompiler,
  ctx: chooks.EventContext,
): ManagerInterface {
  const slashStore = new chooks.CommandStore<chooks.SlashCommand>();
  const textStore = new chooks.CommandStore<chooks.TextCommand>();
  const eventStore = new chooks.EventStore();

  // @todo(Choooks22): Remove event importing from event manager
  const eventManager = chooks.createEventManager(eventStore, ctx);
  const commandManager = chooks.createCommandManager(textStore, ctx);
  const interactionManager = chooks.createInteractionManager(slashStore, ctx, {
    ...ctx.config.credentials,
    guildId: ctx.config.devServer,
  });

  const loadEvents = async () => {
    await loader.importFiles<chooks.Event>(compiler, 'events', event => {
      eventStore.set(event);
    });
    eventManager.load();
  };

  const loadCommands = async () => {
    await loader.importFiles<chooks.SlashCommand | chooks.TextCommand>(compiler, 'commands', command => {
      if (chooks.isTextCommand(command)) {
        textStore.set(command.name, command);
        if (!Array.isArray(command.aliases)) {
          return;
        }
        for (const alias of command.aliases) {
          textStore.set(alias, command);
        }
      } else {
        slashStore.set(command.name, command);
      }
    });
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
