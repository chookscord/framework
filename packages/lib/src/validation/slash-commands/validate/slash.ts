import type { SlashCommand } from '../../../types';
import { commandHasExecute } from '../_execute';
import { logger } from '../../_logger';
import { validateBaseCommand } from './base';

export function validateSlashCommand(
  command: SlashCommand,
): string | null {
  logger.trace('Validating slash command...');
  const baseCommandError = validateBaseCommand(command);
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
