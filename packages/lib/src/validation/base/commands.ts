import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';

export function validateContextCommand(
  interaction: Partial<types.ChooksContextCommand>,
): validate.ValidationError {
  return validate.assert(
    interaction.name!,
    validate.testInteractionName,
  ) ??
  validate.assert(
    interaction.type,
    type => type === 'MESSAGE' || type === 'USER',
    'Invalid command type.',
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
