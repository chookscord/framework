import { MessageHandler, MessageValidator } from '../../types';

interface MessageHandlerStore {
  validator: MessageValidator;
  handler: MessageHandler;
}

const defaults: MessageHandlerStore = {
  validator(ctx, message) {
    return !message.author.bot && !message.webhookId && message.content.startsWith(ctx.config.prefix);
  },
  handler(ctx, getCommand, message) {
    const messageContent = message.content.trim();
    const [commandName, ...args] = messageContent
      .trim()
      .slice(ctx.config.prefix?.length)
      .split(/ +/g);

    const command = getCommand(commandName);

    if (command) {
      return [command, args];
    }

    // @todo(Choooks22): Subcommands

    return [];
  },
};

const user = {} as MessageHandlerStore;

export function getMessageValidator(): MessageValidator {
  return user.validator ?? defaults.validator;
}

export function getMessageHandler(): MessageHandler {
  return user.handler ?? defaults.handler;
}

export function setMessageValidator(validator: MessageValidator): void {
  user.validator = validator;
}

export function setMessageHandler(handler: MessageHandler): void {
  user.handler = handler;
}
