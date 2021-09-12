import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { optionIsType } from '../checks';

export function validateOption(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option,
    optionIsType(['STRING', 'INTEGER', 'NUMBER']),
    'Invalid',
  );
}

export function validateNonCommandOption(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option,
    option => !optionIsType(['SUB_COMMAND_GROUP', 'SUB_COMMAND'], option),
    'Invalid option type.',
  ) ?? validate.assert(
    option.options,
    validate.isType('undefined'),
    'Options cannot have options.',
  );
}

export function validateSubCommandOption(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option,
    optionIsType(['SUB_COMMAND']),
    'Invalid option type.',
  ) ??
  validate.assert(
    (option as any).execute,
    validate.isType('function'),
    'Missing execute handler.',
  ) ??
  validate.assert(
    option.options ?? [],
    validate.testEach(validateNonCommandOption),
  );
}

export function validateGroupCommandOption(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option,
    optionIsType(['SUB_COMMAND_GROUP']),
    'Invalid option type.',
  ) ??
  validate.assert(
    (option as any).execute,
    validate.isType('function'),
    'Subcommand groups cannot have execute handlers.',
  ) ??
  validate.assert(
    option.options?.length ?? 0,
    x => x > 0,
    'Missing subcommands.',
  ) ??
  validate.assert(
    option.options!,
    validate.testEach(validateSubCommandOption),
  );
}
