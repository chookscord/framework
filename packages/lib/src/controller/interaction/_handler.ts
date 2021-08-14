import type { CommandStore, EventContext } from '../../';
import type { Interaction } from 'discord.js';

interface InteractionHandler {
  register: () => void;
  unregister: () => void;
}

export function createInteractionHandler(
  ctx: EventContext,
  commandStore: CommandStore,
): InteractionHandler {
  console.debug('[Interaction Handler]: Interaction Handler created.');
  const handler = async (interaction: Interaction) => {
    console.debug('[Interaction Handler]: Interaction received.');

    if (!interaction.isCommand()) {
      console.debug('[Interaction Handler]: Interaction not a command.');
      return;
    }

    const command = commandStore.get('slash', interaction.commandName);
    if (!command) {
      console.debug('[Interaction Handler]: No command found.');
      return;
    }

    try {
      const start = Date.now();
      console.info(`[Interaction Handler]: Executing command "${command.name}"...`);
      await command.execute({ ...ctx, interaction });
      const end = Date.now() - start;
      console.info(`[Interaction Handler]: "${command.name}" finished! Command took: ${end}ms`);
    } catch (error) {
      console.error(`[Interaction Handler]: Command "${command.name}" threw an error!`);
      console.error('[Interaction Handler]:', error);
    }
  };

  const register: InteractionHandler['register'] = () => {
    ctx.client.on('interactionCreate', handler);
    console.info('[Interaction Handler]: Interaction Handler registered.');
  };

  const unregister: InteractionHandler['unregister'] = () => {
    ctx.client.removeListener('interactionCreate', handler);
    console.info('[Interaction Handler]: Interaction Handler unregistered.');
  };

  return {
    register,
    unregister,
  };
}
