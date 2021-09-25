import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { validateInteraction } from '..';

export function validateUserCommand(
  command: types.ChooksUserCommand,
): validate.ValidationError {
  return validate.assert(
    command.type,
    type => type === 'USER',
    'Invalid user command type.',
  ) ??
  validate.assert(
    command,
    validateInteraction,
  );
}
