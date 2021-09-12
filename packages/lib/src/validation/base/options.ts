import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';
import { optionIsType } from '../checks';
import { validateChoiceList } from './choices';

// Maybe expose these somewhere, idk.
const TYPES_WITH_CHOICES: types.ChooksCommandOptionType[] = [
  'STRING',
  'INTEGER',
  'NUMBER',
];

const TYPES_WITHOUT_CHOICES: types.ChooksCommandOptionType[] = [
  'BOOLEAN',
  'CHANNEL',
  'MENTIONABLE',
  'ROLE',
  'SUB_COMMAND',
  'SUB_COMMAND_GROUP',
  'USER',
];

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
    option,
    option => {
      if (optionIsType(TYPES_WITH_CHOICES, option)) {
        return validateOptionWithChoices(option);
      }

      if (optionIsType(TYPES_WITHOUT_CHOICES, option)) {
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
