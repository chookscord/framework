import type { CommandStore, EventContext } from '../../';
import { getMessageHandler, getMessageValidator } from '../../cache';
import type { Message } from 'discord.js';

interface CommandHandler {
  register: () => void;
  unregister: () => void;
}

export function createCommandHandler(
  ctx: EventContext,
  commandStore: CommandStore,
): CommandHandler {
  console.debug('[Command Handler]: Command Handler created.');
  const handler = async (message: Message) => {
    console.debug('[Command Handler]: Message received.');
    const validateMessage = getMessageValidator();
    const valid = await validateMessage(ctx, message);
    if (!valid) {
      console.debug('[Command Handler]: Message invalid.');
      return;
    }

    const handleMessage = getMessageHandler();
    const [command, args] = await handleMessage(ctx, commandStore.get, message);
    if (!command) {
      console.debug('[Command Handler]: No commands.');
      return;
    }

    try {
      const start = Date.now();
      console.info(`[Command Handler]: Executing command "${command.name}"...`);
      await command.execute({ ...ctx, message, args });
      const end = Date.now() - start;
      console.info(`[Command Handler]: "${command.name}" finished! Command took: ${end}ms`);
    } catch (error) {
      // @todo(Choooks22): Better logging
      console.error(`[Command Handler]: Command "${command.name}" threw an error!`);
      console.error('[Command Handler]:', error);
    }
  };

  const register = () => {
    ctx.client.on('messageCreate', handler);
    console.info('[Command Handler] Command Handler registered.');
  };

  const unregister = () => {
    ctx.client.removeListener('messageCreate', handler);
    console.info('[Command Handler] Command Handler unregistered.');
  };

  return {
    register,
    unregister,
  };
}
