import type { ChooksGroupCommandOption, ChooksSubCommand } from '@chookscord/types';
import { commandHasExecute } from '../_execute';
import { logger } from '../../_logger';
import { validateCommandInfo } from './base';
import { validateSlashSubCommandOption } from './subcommand';

// eslint-disable-next-line complexity
export function validateSubCommandGroupOption(
  option: ChooksGroupCommandOption,
): string | null {
  logger.trace('Validating sub command group option...');
  if (option.type !== 'SUB_COMMAND_GROUP') {
    logger.trace('Option type FAIL.');
    return 'Subcommand groups must be of type "SUB_COMMAND_GROUP"!';
  }

  logger.trace('Option type OK.');
  if (commandHasExecute(option as never)) {
    logger.trace('commandHasExecute FAIL.');
    return 'Subcommand groups cannot have an execute handler!';
  }

  logger.trace('commandHasExecute OK.');
  if (!Array.isArray(option.options) || !option.options.length) {
    logger.trace('Sub option exists FAIL.');
    return 'Subcommand groups must have subcommands!';
  }

  logger.trace('Sub option exists OK.');
  for (const subOption of option.options) {
    const subCommandOptionError = validateSlashSubCommandOption(subOption);
    if (subCommandOptionError) {
      logger.trace('validateSlashSubCommandOption FAIL.');
      return subCommandOptionError;
    }
  }

  logger.trace('validateSlashSubCommandOption OK.');
  logger.trace('Validate sub command group option OK.');
  return null;
}

// eslint-disable-next-line complexity
export function validateSubCommandGroup(
  command: ChooksSubCommand,
): string | null {
  logger.trace('Validating sub command group...');
  const slashCommandError = validateCommandInfo(command);
  if (slashCommandError) {
    logger.trace('validateBaseCommand FAIL.');
    return slashCommandError;
  }

  logger.trace('validateBaseCommand OK.');
  if (commandHasExecute(command)) {
    logger.trace('commandHasExecute FAIL.');
    return 'Subcommand groups must not have an execute handler in root!';
  }

  logger.trace('commandHasExecute OK.');
  if (!Array.isArray(command.options) || !command.options.length) {
    logger.trace('Command option FAIL.');
    return 'Subcommand groups must have subcommand groups!';
  }

  logger.trace('Command option OK.');
  for (const option of command.options) {
    const groupSubCommandOptionError = validateSubCommandGroupOption(option as ChooksGroupCommandOption);
    if (groupSubCommandOptionError) {
      logger.trace('validateSubCommandGroup FAIL.');
      return groupSubCommandOptionError;
    }
  }

  logger.trace('validateSubCommandGroup OK.');
  logger.trace('Validate sub command group OK.');
  return null;
}
