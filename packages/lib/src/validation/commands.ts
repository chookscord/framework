import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { validateCommandOption } from '.';
import { validateNonCommandOption } from './options';

export function validateBaseCommand(
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

export function validateSlashCommand(
  command: types.ChooksCommand,
): validate.ValidationError {
  return validate.assert(
    command,
    validateBaseCommand,
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

export function validateSubCommand(
  command: types.ChooksCommand,
): validate.ValidationError {
  return validate.assert(
    command,
    validateBaseCommand,
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
