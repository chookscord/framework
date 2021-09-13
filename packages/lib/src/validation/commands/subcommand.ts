import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { validateCommand } from '..';

export function validateSubCommand(
  command: types.ChooksCommand,
): validate.ValidationError {
  return validate.assert(
    command,
    validateCommand,
  );
}
