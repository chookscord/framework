import * as lib from '@chookscord/lib';
import type * as types from '../../../../types';
import * as utils from '../../../../utils';
import type { Client, Interaction } from 'discord.js';
import type { ChooksSlashCommand } from '@chookscord/types';
import { createOnCompile } from './_compile';
import { createOnDelete } from './_delete';
import { createWatchCompiler } from '../../compiler';

const logger = lib.createLogger('[cli] Commands');

// @todo(Choooks22): [Proposal] Create centralized interaction listener.
// Each module would then "append" their handler to the listener.
function createListener(
  client: Client,
  store: lib.Store<ChooksSlashCommand>,
) {
  logger.success('Slash command listener created.');
  // eslint-disable-next-line complexity
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

    if (typeof command.execute !== 'function') {
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

export function init(
  config: types.ModuleConfig,
  store: lib.Store<ChooksSlashCommand>,
): types.ReloadModule {
  let ctx = config.ctx;
  const paths: Record<string, string> = {};

  const load = (client: Client) => {
    logger.info('Attaching interaction listener to client...');
    client.on('interactionCreate', createListener(client, store));
    logger.success('Interaction listener attached to client.');
  };

  const reload: types.ReloadModule = newCtx => {
    logger.info('Refreshing commands...');
    // @todo(Choooks22): Detect changes in config
    // and recreate client and register if needed.
    ctx = newCtx;
    // load(ctx.client);
    logger.info(`${store.size} commands refreshed.`);
  };

  createWatchCompiler({
    ...config,
    onCompile: createOnCompile(logger, paths, store, config.register),
    onDelete: createOnDelete(logger, paths, store, config.register),
  });

  load(ctx.client as Client);
  return reload;
}
