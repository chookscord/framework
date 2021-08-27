import * as chooks from '..';
import { validateOption } from '../validation/slash-commands/_option';

export function options(option: chooks.CommandOption): chooks.ApplicationOption {
  const error = validateOption(option);
  if (error) {
    throw new Error(error);
  }

  const subOptions = (option as chooks.SubCommandOption).options;

  return {
    name: option.name,
    description: option.description,
    type: chooks.CommandOptionType[option.type],
    options: subOptions?.length
      ? subOptions.map(options)
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-shadow
export function command(command: chooks.SlashCommand): chooks.ApplicationSlashCommand {
  const error = chooks.validateBaseCommand(command);
  if (error) {
    throw new Error(error);
  }

  return {
    type: chooks.CommandType.CHAT_INPUT,
    description: command.description,
    name: command.name,
    options: command.options?.length
      ? command.options.map(options)
      : undefined,
  };
}
