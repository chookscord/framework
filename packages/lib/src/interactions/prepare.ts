import * as lib from '..';
import { logger } from './_logger';
import { validateOption } from '../validation/slash-commands/_option';

function prepareOption(option: lib.CommandOption & { choices?: lib.CommandChoice[] }): lib.ApplicationOption {
  const error = validateOption(option);
  if (error) {
    throw new Error(error);
  }

  const subOptions = (option as lib.SubCommandOption).options;

  return {
    name: option.name,
    description: option.description,
    type: lib.CommandOptionType[option.type],
    choices: option.choices,
    required: option.required,
    options: subOptions?.length
      ? subOptions.map(prepareOption)
      : undefined,
  };
}

function prepareCommand(command: lib.SlashCommand): lib.ApplicationSlashCommand {
  const error = lib.validateBaseCommand(command);
  if (error) {
    throw new Error(error);
  }

  return {
    type: lib.CommandType.CHAT_INPUT,
    description: command.description,
    name: command.name,
    options: command.options?.length
      ? command.options.map(prepareOption)
      : undefined,
  };
}

export function prepareCommands(
  commands: Iterable<lib.SlashCommand>,
): lib.BaseApplicationCommand[] {
  logger.info('Preparing commands...');
  let counter = 0;
  const preparedCommands: lib.ApplicationSlashCommand[] = [];
  for (const command of commands) {
    const appCommand = prepareCommand(command);
    preparedCommands.push(appCommand);
    logger.debug(`Prepared ${++counter} commands.`);
  }
  logger.info(`${counter} commands prepared.`);
  return preparedCommands;
}
