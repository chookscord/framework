import type { ChooksSlashCommand } from '@chookscord/types';
import { commandHasExecute } from '../_execute';
import { logger } from '../../_logger';
import { validateCommandInfo } from './base';

export function validateSlashCommand(
  command: ChooksSlashCommand,
): string | null {
  logger.trace('Validating slash command...');
  const baseCommandError = validateCommandInfo(command);
  if (baseCommandError) {
    logger.trace('baseCommandError FAIL.');
    return baseCommandError;
  }

  logger.trace('baseCommandError OK.');
  if (!commandHasExecute(command)) {
    logger.trace('commandHasExecute FAIL.');
    return 'Slash commands must have an execute handler!';
  }

  logger.trace('commandHasExecute OK.');
  logger.trace('Validate slash command OK.');
  return null;
}
