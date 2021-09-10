import type { ChooksCommand } from '@chookscord/types';
import { logger } from '../../_logger';
import { validateOptionDescription } from '../_description';
import { validateOptionName } from '../_name';

export function validateCommandInfo(
  command: Pick<ChooksCommand, 'name' | 'description'>,
): string | null {
  logger.trace('Validating base command...');
  const nameError = validateOptionName(command.name);
  if (nameError) {
    logger.trace('validateOptionName FAIL.');
    return nameError;
  }

  logger.trace('validateOptionName OK.');
  const descriptionError = validateOptionDescription(command.description);
  if (descriptionError) {
    logger.trace('validateOptionDescription FAIL.');
    return descriptionError;
  }

  logger.trace('validateOptionDescription OK.');
  logger.trace('Validate base command OK.');
  return null;
}
