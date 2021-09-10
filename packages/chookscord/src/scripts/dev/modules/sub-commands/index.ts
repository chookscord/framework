import * as lib from '@chookscord/lib';
import * as types from '../../../../types';
import * as utils from '../../../../utils';
import type { Client, CommandInteraction, Interaction } from 'discord.js';
import { createOnCompile } from './_compile';
import { createOnDelete } from './_delete';
import { createWatchCompiler } from '../../compiler';
import { ChooksSubCommand } from '@chookscord/types';

const logger = lib.createLogger('[cli] Sub Commands');

function getSubCommand(interaction: CommandInteraction): string | null {
  try {
    return interaction.options.getSubcommand();
  } catch {
    return null;
  }
}

// Duplicated from /scripts/dev/modules/commands.
function createListener(
  client: Client,
  store: lib.Store<ChooksSubCommand>,
) {
  logger.success('Slash command listener created.');
  // eslint-disable-next-line complexity
  return async (interaction: Interaction) => {
    logger.debug('Interaction received.');
    if (!interaction.isCommand()) {
      logger.debug('Interaction is not a command.');
      return;
    }

    const subCommandName = getSubCommand(interaction);
    if (!subCommandName) {
      return;
    }

    const commandName = interaction.commandName;
    const command = store.get(commandName);

    if (!command) {
      logger.warn(`Command "${commandName}" was recieved, but no handler was present!`);
      return;
    }

    const subCommand = command.options.find(
      option => option.name === subCommandName,
    );

    if (!subCommand) {
      logger.warn(`Missing subcommand "${subCommandName}" from "${commandName}"!`);
      return;
    }

    if (typeof subCommand.execute !== 'function') {
      return;
    }

    try {
      logger.info(`Executing command "${commandName}"...`);
      const stopTimer = utils.createTimer();
      await subCommand.execute({
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
  store: lib.Store<ChooksSubCommand>,
): types.ReloadModule {
  let ctx = config.ctx;
  const paths: Record<string, string> = {};

  const load = (client: Client) => {
    logger.info('Attaching interaction listener to client...');
    client.on('interactionCreate', createListener(client, store));
    logger.success('Interaction listener attached to client.');
  };

  const reload: types.ReloadModule = newCtx => {
    logger.info('Refreshing sub commands...');
    ctx = newCtx;
    logger.success('Refreshed sub commands.');
  };

  createWatchCompiler({
    ...config,
    onCompile: createOnCompile(logger, paths, store, config.register),
    onDelete: createOnDelete(logger, paths, store, config.register),
  });

  load(ctx.client as Client);
  return reload;
}
