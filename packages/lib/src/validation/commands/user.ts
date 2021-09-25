import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { validateContext } from '../base';

export function validateUserCommand(
  command: types.ChooksContextCommand,
): validate.ValidationError {
  return validate.assert(
    command.type,
    type => type === 'USER',
    'Invalid user command type.',
  ) ??
  validate.assert(
    command,
    validateContext,
  );
}
