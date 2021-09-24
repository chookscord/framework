import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { validateInteraction } from '..';

export function validateMessageCommand(
  command: types.ChooksMessageCommand,
): validate.ValidationError {
  return validate.assert(
    command.type,
    type => type === 'MESSAGE',
    'Invalid message command type.',
  ) ??
  validate.assert(
    command,
    validateInteraction,
  );
}
