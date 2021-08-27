import { logger } from '../_logger';

export function validateOptionDescription(description: string): string | null {
  logger.trace('Validating option description...');
  if (!description) {
    logger.trace('Option description exists FAIL.');
    return 'Slash commands must have a description!';
  }

  logger.trace('Option description exists OK.');
  if (description.length > 100) {
    logger.trace('Option description length FAIL.');
    return 'Command descriptions must not have more than 100 characters!';
  }

  logger.trace('Option description length OK.');
  logger.trace('Validate option description OK.');
  return null;
}
