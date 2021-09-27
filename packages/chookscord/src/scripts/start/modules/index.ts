import * as lib from '@chookscord/lib';
import type * as types from '@chookscord/types';
import * as utils from '../../../utils';
import type { ModuleContext, ModuleName } from '../../../types';
import type { CommandInteraction } from 'discord.js';

export type CommandHandler = Exclude<types.ChooksCommand['execute'], undefined>;

const logger = lib.createLogger('[cli] Modules');

function attachListener(
  ctx: ModuleContext,
  store: lib.Store<CommandHandler>,
) {
  // @todo(Choooks22): Cleanup this mess
  const executeHandler = async (
    commandName: string,
    execute: () => unknown,
  ) => {
    try {
      logger.info(`Executing command "${commandName}"...`);
      const endTimer = utils.createTimer();
      await execute();
      logger.success(`Finished executing command "${commandName}". Time took: ${endTimer().toLocaleString()}ms`);
    } catch (error) {
      logger.error(new Error(`Failed to execute command "${commandName}"!`));
      logger.error(error);
    }
  };

  const handleCommands = (interaction: CommandInteraction) => {
    const commandKey = utils.createCommandKey(
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false),
    );

    const execute = store.get(commandKey);

    if (!execute) {
      logger.warn(`Command "${commandKey}" was executed, but no handler was found!`);
      return;
    }

    executeHandler(
      commandKey,
      async () => {
        await execute({
          logger: lib.createLogger(`[commands] ${commandKey}`),
          client: ctx.client,
          fetch: ctx.fetch,
          interaction,
        });
      },
    );
  };

  ctx.client.on('interactionCreate', interaction => {
    if (interaction.isCommand()) {
      handleCommands(interaction);
    } else if (interaction.isContextMenu()) {
      const commandName = interaction.commandName;
      const execute = store.get(commandName);

      if (!execute) {
        logger.warn(`Command "${commandName}" was executed, but not handler was found!`);
        return;
      }

      executeHandler(commandName, async () => {
        await execute({
          logger: lib.createLogger(`[commands] ${commandName}`),
          client: ctx.client,
          fetch: ctx.fetch,
          interaction,
        });
      });
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
      } return;
      case 'contexts': {
        const store = getCommandStore();
        const { getContextCommands } = await import('./context-commands');
        for await (const [key, command] of getContextCommands(modulePath)) {
          store.set(key, command.execute);
        }
      }
    }
  };
}
