/* eslint-disable @typescript-eslint/no-throw-literal */
import type { CommandStore, EventContext, TextCommand } from '../../';
import { getMessageHandler, getMessageValidator } from '../../cache';
import type { Message } from 'discord.js';

interface CommandHandler {
  register: () => void;
  unregister: () => void;
}

export function createCommandHandler(
  store: CommandStore<TextCommand>,
  ctx: EventContext,
): CommandHandler {
  const getCommand = (commandName: string) => {
    return store.get(commandName);
  };

  // Part 1: Check if message is a valid command first
  const validate = async (message: Message) => {
    const validator = getMessageValidator();
    const isValid = await validator(ctx, message);
    if (!isValid) throw null;
  };

  // Part 2: Find command and parsed args from message content
  const handle = async (message: Message) => {
    const messageHandler = getMessageHandler();
    const [command, args] = await messageHandler(ctx, getCommand, message);

    if (!command) throw null;
    return [command, args ?? []] as [TextCommand, string[]];
  };

  // Part 3: Execute command (with monitoring and error handling)
  const execute = async (
    message: Message,
    command: TextCommand,
    args: string[],
  ) => {
    try {
      const start = Date.now();
      console.info(`[Command Handler]: Executing command "${command.name}"...`);
      await command.execute({ ...ctx, message, args });
      const end = Date.now() - start;
      console.info(`[Command Handler]: "${command.name}" finished! Command took: ${end}ms`);
    } catch (error) {
      // @todo(Choooks22): Better logging
      console.error(`[Command Handler]: Command "${command.name}" threw an error!`);
      console.error('[Command Handler]:', error?.message);
    }
  };

  // The actual message handler that will be passed to the client
  const handler = async (message: Message) => {
    try {
      await validate(message);
      const context = await handle(message);
      await execute(message, ...context);
    } catch (error) {
      if (error instanceof Error) {
        console.error('[Command Handler]: Could not validate message!');
        console.error('[Command Handler]:', error.message);
      }
    }
  };

  return {
    register() {
      ctx.client.on('messageCreate', handler);
      console.info('[Command Handler] Command Handler registered.');
    },
    unregister() {
      ctx.client.removeListener('messageCreate', handler);
      console.info('[Command Handler] Command Handler unregistered.');
    },
  };
}
