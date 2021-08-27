import type { BaseSlashCommand, Command, SlashSubCommand } from '../../../types';
import type { SubCommandOption } from '../../../types/interactions';
import { commandHasExecute } from '../_execute';
import { logger } from '../../_logger';
import { validateBaseCommand } from './base';

// eslint-disable-next-line complexity
export function validateSlashSubCommandOption(
  option: SubCommandOption & BaseSlashCommand,
): string | null {
  logger.trace('Validating slash sub command option...');
  const slashCommandError = validateBaseCommand(option);
  if (slashCommandError) {
    logger.trace('validateBaseCommand FAIL.');
    return slashCommandError;
  }

  logger.trace('validateBaseCommand OK.');
  if (option.type !== 'SUB_COMMAND') {
    logger.trace('Option type FAIL.');
    return 'Subcommands must be of type "SUB_COMMAND"!';
  }

  logger.trace('Option type OK.');
  if (!commandHasExecute(option)) {
    logger.trace('commandHasExecute FAIL.');
    return 'Subcommands must have an execute handler!';
  }

  logger.trace('commandHasExecute OK.');
  if (Array.isArray(option.options) && option.options.length) {
    logger.trace('Option has sub options.');
    for (const subOption of option.options) {
      if (commandHasExecute(subOption as unknown as Command)) {
        logger.trace('Sub option FAIL.');
        return 'Subcommands cannot have subcommands!';
      }
      logger.trace('Sub options OK.');
    }
  }

  logger.trace('Validate slash sub command option OK.');
  return null;
}

// eslint-disable-next-line complexity
export function validateSlashSubCommand(
  command: SlashSubCommand,
): string | null {
  logger.trace('Validating slash sub command...');
  const slashCommandError = validateBaseCommand(command);
  if (slashCommandError) {
    logger.trace('validateBaseCommand FAIL.');
    return slashCommandError;
  }

  logger.trace('validateBaseCommand OK.');
  if (!Array.isArray(command.options) || !command.options.length) {
    logger.trace('Command option exists FAIL.');
    return 'Subcommands must have subcommands!';
  }

  logger.trace('Command option exists OK.');
  for (const option of command.options) {
    const subCommandOptionError = validateSlashSubCommandOption(option);
    if (subCommandOptionError) {
      logger.trace('Command option FAIL.');
      return subCommandOptionError;
    }
  }

  logger.trace('Command option OK.');
  if (commandHasExecute(command)) {
    logger.trace('commandHasExecute FAIL.');
    return 'Subcommands must not have an execute handler in root!';
  }

  logger.trace('commandHasExecute OK.');
  logger.trace('Validate slash sub command OK.');
  return null;
}
