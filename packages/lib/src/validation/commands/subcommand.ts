import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { validateCommand } from '../base';
import { validateCommandOption } from '../options';

export function validateSubCommand(
  command: types.ChooksCommand,
): validate.ValidationError {
  return validate.assert(
    command,
    validateCommand,
  ) ??
  validate.assert(
    command.options?.length ?? 0,
    validate.inRange(1, 25),
    'Invalid subcommands size.',
  ) ??
  validate.assert(
    command.options!,
    validate.testEach(validateCommandOption),
  );
}
