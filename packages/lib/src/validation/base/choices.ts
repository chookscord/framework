import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';

export function validateChoice(
  choice: Partial<types.DiscordCommandOptionChoice>,
): validate.ValidationError {
  return validate.assert(
    choice.name,
    validate.isType('string'),
    'Invalid choice name.',
  ) ??
  validate.assert(
    choice.name?.length ?? 0,
    validate.inRange(1, 100),
    'Invalid name length.',
  ) ??
  validate.assert(
    choice.value,
    value => validate.isType('number', value) ||
      validate.isType('string', value) &&
      validate.inRange(1, 100, (value as string).length),
    'Invalid choice value.',
  );
}

export function validateChoiceList(
  choices: types.DiscordCommandOptionChoice[],
): validate.ValidationError {
  return validate.assert(
    choices.length ?? 0,
    validate.inRange(0, 25),
    'Invalid choice amount.',
  ) ??
  validate.assert(
    choices,
    validate.testEach(validateChoice),
  );
}
