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
  ) ??
  validate.assert(
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
  );
}
