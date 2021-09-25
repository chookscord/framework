import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { isOptionWithChoice, isOptionWithoutChoice } from '../guards';
import { validateChoiceList } from './choices';

export function validateOptionWithoutChoice(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option.choices,
    validate.isType('undefined'),
    'Unexpected choices in option.',
  );
}

export function validateOptionWithChoices(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option.choices ?? [],
    validateChoiceList,
  );
}

export function validateOption(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option.name,
    validate.testCommandName,
  ) ??
  validate.assert(
    option.description,
    validate.testDescription,
  ) ??
  validate.assert(
    option.description.length ?? 0,
    validate.inRange(0, 100),
    'Invalid description length.',
  ) ??
  validate.assert(
    option.options?.length ?? 0,
    validate.inRange(0, 25),
    'Invalid options size.',
  ) ??
  validate.assert(
    option,
    option => {
      if (isOptionWithChoice(option)) {
        return validateOptionWithChoices(option);
      }

      if (isOptionWithoutChoice(option)) {
        return validateOptionWithoutChoice(option);
      }

      return 'Invalid option type.';
    },
  );
}

export function validateNonCommandOption(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option,
    validateOption,
  ) ??
  validate.assert(
    option.type,
    type => !['SUB_COMMAND', 'SUB_COMMAND_GROUP'].includes(type),
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
    validateOption,
  ) ??
  validate.assert(
    option.type,
    type => type === 'SUB_COMMAND',
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
    validateOption,
  ) ??
  validate.assert(
    option.type,
    type => type === 'SUB_COMMAND_GROUP',
    'Invalid option type.',
  ) ??
  validate.assert(
    // @ts-expect-error validation
    option.execute,
    execute => !validate.isType('function', execute),
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

export function validateCommandOption(
  option: types.ChooksCommandOption,
): validate.ValidationError {
  return validate.assert(
    option,
    option => {
      if (option.type === 'SUB_COMMAND_GROUP') {
        return validateGroupCommandOption(option);
      }

      if (option.type === 'SUB_COMMAND') {
        return validateSubCommandOption(option);
      }

      return 'Invalid command type.';
    },
  );
}
