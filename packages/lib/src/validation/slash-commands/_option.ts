import { CommandOption } from '../../types/interactions';
import { logger } from '../_logger';
import { validateOptionDescription } from './_description';
import { validateOptionName } from './_name';

export function optionIsCommand(option: CommandOption): boolean {
  return option.type === 'SUB_COMMAND' || option.type === 'SUB_COMMAND_GROUP';
}

// eslint-disable-next-line complexity
export function optionHasType(option: CommandOption): boolean {
  logger.trace('Checking option type...');
  const hasType =
    option.type === 'BOOLEAN' ||
    option.type === 'CHANNEL' ||
    option.type === 'INTEGER' ||
    option.type === 'MENTIONABLE' ||
    option.type === 'NUMBER' ||
    option.type === 'ROLE' ||
    option.type === 'STRING' ||
    option.type === 'SUB_COMMAND' ||
    option.type === 'SUB_COMMAND_GROUP' ||
    option.type === 'USER';

  logger.trace(`Option type ${hasType ? 'OK' : 'FAIL'}.`);
  return hasType;
}

export function validateOption(option: CommandOption): string | null {
  logger.trace('Validating options...');
  const nameError = validateOptionName(option.name);
  if (nameError) {
    logger.trace('validateOptionName FAIL.');
    return nameError;
  }

  logger.trace('validateOptionName OK.');
  const descError = validateOptionDescription(option.description);
  if (descError) {
    logger.trace('validateOptionDescription FAIL.');
    return descError;
  }

  logger.trace('validateOptionDescription OK.');
  if (!optionHasType(option)) {
    logger.trace('optionHasType FAIL.');
    return 'Options must have a valid type!';
  }

  logger.trace('optionHasType OK.');
  logger.trace('Option validated OK.');
  return null;
}
