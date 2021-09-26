import * as lib from '@chookscord/lib';
import type { Client, CommandInteraction } from 'discord.js';
import { createCommandKey, createTimer } from '../../../utils';
import type { ChooksCommandContext } from '@chookscord/types';
import type { CommandModule } from '../../../types';
import type { Consola } from 'consola';

interface CommandReference {
  key: string;
  command: CommandModule;
}

// Maybe extract
function getCtx(
  client: Client,
  commandName: string,
  interaction: CommandInteraction,
): ChooksCommandContext {
  return {
    fetch: lib.fetch,
    client,
    interaction,
    logger: lib.createLogger(`[commands] ${commandName}`),
  };
}

function getCommandRef(
  store: lib.Store<CommandModule>,
  interaction: CommandInteraction,
): CommandReference | { key: string; command: null } {
  const key = createCommandKey(
    interaction.commandName,
    interaction.options.getSubcommandGroup(false),
    interaction.options.getSubcommand(false),
  );
  return {
    key,
    command: store.get(key),
  };
}

async function executeCommand(
  commandName: string,
  execute: () => unknown,
  logger?: Consola,
): Promise<void> {
  try {
    logger?.info(`Executing command "${commandName}"...`);
    const endTimer = createTimer();
    await execute();
    logger?.success(`Finished executing command "${commandName}". Time took: ${endTimer().toLocaleString()}ms`);
  } catch (error) {
    logger?.error(`Failed to execute command "${commandName}"!`);
    logger?.error(error);
  }
}

export function attachInteractionListener(
  client: Client,
  store: lib.Store<CommandModule>,
  options: Partial<lib.Logger> = {},
): void {
  // @todo(Choooks22): This should be generalized further to make it reusable
  const handleCommand = (interaction: CommandInteraction) => {
    const { key, command } = getCommandRef(store, interaction);
    if (command) {
      const ctx = getCtx(client, key, interaction);
      executeCommand(
        key,
        // @todo(Choooks22): Bind dependencies to 'this'
        command.execute.bind(command, ctx),
        options.logger,
      );
    } else {
      options?.logger?.warn(`Command "${key}" was executed, but no handlers were registered.`);
    }
  };

  client.on('interactionCreate', interaction => {
    if (interaction.isCommand()) {
      handleCommand(interaction);
    } else if (interaction.isContextMenu()) {
      // @todo(Choooks22): Extract this to handle command
      const key = interaction.commandName;
      const command = store.get(key);
      if (command) {
        executeCommand(
          key,
          command.execute.bind(command, {
            client,
            fetch: lib.fetch,
            interaction,
            logger: lib.createLogger(`[commands] ${key}`),
          }),
        );
      } else {
        options.logger?.warn(`Command "${key}" was execute, but no handlers were registered.`);
      }
    }
  });
}
