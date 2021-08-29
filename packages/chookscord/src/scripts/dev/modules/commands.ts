import * as lib from '@chookscord/lib';
import * as path from 'path';
import * as utils from '../../../utils';
import type { Client, Interaction } from 'discord.js';
import type { ModuleConfig, ReloadModule } from './_types';
import { UpdateListener, createWatchCompiler } from '../compiler';

const logger = lib.createLogger('[cli] Commands');

// @todo(Choooks22): [Proposal] Create centralized interaction listener.
// Each module would then "append" their handler to the listener.
function createListener(
  client: Client,
  store: lib.CommandStore<lib.BaseSlashCommand>,
) {
  logger.success('Slash command listener created.');
  return async (interaction: Interaction) => {
    logger.debug('Interaction received.');
    if (!interaction.isCommand()) {
      logger.debug('Interaction is not a command.');
      return;
    }

    const commandName = interaction.commandName;
    const command = store.get(commandName);

    if (!command) {
      logger.warn(`Command "${commandName}" was recieved, but no handler was present!`);
      return;
    }

    try {
      logger.info(`Executing command "${commandName}"...`);
      const stopTimer = utils.createTimer();
      await command.execute({
        client,
        fetch: lib.fetch,
        logger: lib.createLogger(`[commands] ${commandName}`),
        interaction,
      });

      logger.success(`Finished executing command "${commandName}". Time took: ${stopTimer().toLocaleString()}ms`);
    } catch (error) {
      logger.error(`Failed to execute command "${commandName}"!`);
      logger.error(error);
    }
  };
}

function validateCommand(
  filePath: string,
  command: lib.BaseSlashCommand,
): string | null {
  return command
    ? lib.validateSlashCommand(command)
    : `${path.dirname(filePath)} does not have a default export!`;
}

function createOnCompile(
  paths: Record<string, string>,
  store: lib.CommandStore<lib.BaseSlashCommand>,
  register: () => unknown,
): UpdateListener {
  return async filePath => {
    logger.debug('Reloading command...');
    const stopTimer = utils.createTimer();
    const command = await utils.uncachedImportDefault<lib.BaseSlashCommand>(filePath);
    const errorMessage = validateCommand(filePath, command);
    if (errorMessage) {
      logger.error(new Error(errorMessage));
      return;
    }

    const oldCommand = store.get(command.name);
    const didChange = utils.slashCommandChanged(command, oldCommand);

    paths[filePath] = command.name;
    store.set(command.name, command);
    logger.debug(`Command reloaded. Time took: ${stopTimer().toLocaleString()}ms`);

    if (didChange) {
      logger.debug('Command details changed. Reregistering...');
      await register();
      logger.debug('Reregistering complete.');
      return;
    }

    logger.debug('Command details did not changed.');
  };
}

function createOnDelete(
  paths: Record<string, string>,
  store: lib.CommandStore<lib.BaseSlashCommand>,
  register: () => unknown,
): UpdateListener {
  return async filePath => {
    const commandName = paths[filePath];
    logger.debug(`Deleting command "${commandName}"...`);

    delete paths[filePath];
    store.delete(commandName);
    logger.debug(`Command "${commandName}" deleted. Reregistering...`);

    await register();
    logger.debug('Reregistering complete.');
  };
}

export function init(config: ModuleConfig): ReloadModule {
  let ctx = config.ctx;
  const paths: Record<string, string> = {};
  const store = new lib.CommandStore<lib.BaseSlashCommand>();
  const register = lib.createInteractionRegister({
    ...ctx.config.credentials,
    guildId: ctx.config.devServer,
  });

  const registerCommands = utils.debounce(
    utils.registerCommands,
    250,
    register,
    store,
  );

  const load = (client: Client) => {
    logger.info('Attaching interaction listener to client...');
    client.on('interactionCreate', createListener(client, store));
    logger.success('Interaction listener attached to client.');
  };

  const reload: ReloadModule = newCtx => {
    logger.info('Refreshing commands...');
    // @todo(Choooks22): Detect changes in config
    // and recreate client and register if needed.
    ctx = newCtx;
    // load(ctx.client);
    logger.info(`${store.size} commands refreshed.`);
  };

  createWatchCompiler({
    ...config,
    onCompile: createOnCompile(paths, store, registerCommands),
    onDelete: createOnDelete(paths, store, registerCommands),
  });

  load(ctx.client as Client);
  return reload;
}
