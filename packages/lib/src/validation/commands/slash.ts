import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { validateCommand, validateNonCommandOption } from '../base';

export function validateSlashCommand(
  command: types.ChooksCommand,
): validate.ValidationError {
  return validate.assert(
    command,
    validateCommand,
  ) ??
  validate.assert(
    command.type,
    type => validate.isType('undefined', type) || type === 'CHAT_INPUT',
    'Invalid command type.',
  ) ??
  validate.assert(
    command.execute,
    validate.isType('function'),
    'Missing execute handler.',
  ) ??
  validate.assert(
    command.options?.length ?? 0,
    validate.inRange(0, 25),
    'Invalid options size.',
  ) ??
  validate.assert(
    command.options ?? [],
    validate.testEach(validateNonCommandOption),
  );
}
