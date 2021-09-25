import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';

export function validateContext(
  interaction: Partial<types.ChooksContextCommand>,
): validate.ValidationError {
  return validate.assert(
    interaction.name!,
    validate.testInteractionName,
  ) ??
  validate.assert(
    // @ts-expect-error validation
    interaction.description,
    validate.isType('undefined'),
    'Unexpected description in interaction.',
  ) ??
  validate.assert(
    // @ts-expect-error validation
    interaction.options,
    validate.isType('undefined'),
    'Unexpected options in interaction.',
  ) ??
  validate.assert(
    interaction.execute,
    validate.isType('function'),
    'Missing execute handler.',
  );
}

export function validateCommand(
  command: Partial<types.ChooksCommand>,
): validate.ValidationError {
  return validate.assert(
    command.name!,
    validate.testCommandName,
  ) ??
  validate.assert(
    command.description!,
    validate.testDescription,
  );
}
