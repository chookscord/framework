import { logger } from '../_logger';

export function validateOptionName(name: string): string | null {
  logger.trace('Validating option name...');
  if (!name) {
    logger.trace('Option name exists FAIL.');
    return 'Options must have a name!';
  }

  logger.trace('Option name exists OK.');
  if (!/^[a-z\d_-]{1,32}$/.test(name)) {
    logger.trace('Option name pattern FAIL.');
    return 'Command names must have 1-32 lowercase characters!';
  }

  logger.trace('Option name pattern OK.');
  logger.trace('Validate option name OK.');
  return null;
}
