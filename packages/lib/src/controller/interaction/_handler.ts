/* eslint-disable @typescript-eslint/no-throw-literal */
import { CommandInteraction, Interaction } from 'discord.js';
import { CommandStore, SlashCommand } from '../..';
import { EventContext } from '../../types';
import { isCommandGroup } from '../../utils/command-guard';

export interface InteractionHandler {
  register: () => void;
  unregister: () => void;
}

export function createInteractionHandler(
  store: CommandStore<SlashCommand>,
  ctx: EventContext,
): InteractionHandler {
  console.debug('[Interaction Handler]: Interaction Handler created.');

  const execute = async (
    command: SlashCommand,
    interaction: CommandInteraction,
  ) => {
    if (isCommandGroup(command)) {
      // @todo(Choooks22): Find nested command and execute
      console.log('group command', interaction);
    } else {
      await command.execute({ ...ctx, interaction });
    }
  };

  const runCommand = async (
    command: SlashCommand,
    interaction: CommandInteraction,
  ) => {
    try {
      const start = Date.now();
      console.info(`[Interaction Handler]: Executing command "${command.name}"...`);
      await execute(command, interaction);
      const end = Date.now() - start;
      console.info(`[Interaction Handler]: "${command.name}" finished! Command took: ${end}ms`);
    } catch (error) {
      console.error(`[Interaction Handler]: Command "${command.name}" threw an error!`);
      console.error('[Interaction Handler]:', error);
    }
  };

  const handler = async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const command = store.get(interaction.commandName);
    if (!command) return;

    await runCommand(command, interaction);
  };

  return {
    register() {
      ctx.client.on('interactionCreate', handler);
      console.info('[Interaction Handler]: Interaction Handler registered.');
    },
    unregister() {
      ctx.client.removeListener('interactionCreate', handler);
      console.info('[Interaction Handler]: Interaction Handler unregistered.');
    },
  };
}
