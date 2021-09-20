import * as lib from '@chookscord/lib';
import type * as types from '@chookscord/types';
import * as utils from '../../../utils';
import type { CommandInteraction } from 'discord.js';
import type { ModuleContext } from '../../../types';

export type CommandHandler = Exclude<types.ChooksCommand['execute'], undefined>;

export type InteractionName = 'commands' | 'subcommands';
export type ModuleName = InteractionName | 'events';

const logger = lib.createLogger('[cli] Modules');

function attachListener(
  ctx: ModuleContext,
  store: lib.Store<CommandHandler>,
) {
  const handleCommands = async (interaction: CommandInteraction) => {
    const commandKey = lib.createCommandKey(
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false),
    );

    const execute = store.get(commandKey);

    if (!execute) {
      logger.warn(`Command "${commandKey}" was executed, but no handler was found!`);
      return;
    }

    try {
      logger.info(`Executing command "${commandKey}"...`);
      const stopTimer = utils.createTimer();
      await execute({
        logger: lib.createLogger(`[commands] ${commandKey}`),
        client: ctx.client,
        fetch: ctx.fetch,
        interaction,
      });

      logger.success(`Finished executing command "${commandKey}". Time took: ${stopTimer().toLocaleString()}ms`);
    } catch (error) {
      logger.error(new Error(`Failed to execute command "${commandKey}"!`));
      logger.error(error);
    }
  };

  ctx.client.on('interactionCreate', interaction => {
    if (interaction.isCommand()) {
      handleCommands(interaction);
    }
  });
}

export function createModuleLoader(
  ctx: ModuleContext,
): (moduleName: ModuleName) => Promise<void> {
  let commandStore: lib.Store<CommandHandler>;
  const initCommands = () => {
    commandStore = new lib.Store({ name: '[cli] Commands' });
    attachListener(ctx, commandStore);
  };

  const getCommandStore = () => {
    if (!commandStore) initCommands();
    return commandStore;
  };

  // eslint-disable-next-line complexity
  return async moduleName => {
    const modulePath = utils.appendPath.fromOut(moduleName);
    switch (moduleName) {
      case 'events': {
        const { loadEvents } = await import('./events');
        await loadEvents(ctx, modulePath);
      } return;
      // @Choooks22: Maybe these parts can be simplified
      case 'commands': {
        const store = getCommandStore();
        const { getCommands } = await import('./commands');
        for await (const [key, command] of getCommands(modulePath)) {
          store.set(key, command.execute);
        }
      } return;
      case 'subcommands': {
        const store = getCommandStore();
        const { getSubCommands } = await import('./sub-commands');
        for await (const [key, command] of getSubCommands(modulePath)) {
          store.set(key, command.execute);
        }
      }
    }
  };
}
