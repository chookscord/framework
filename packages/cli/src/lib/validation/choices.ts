/* eslint-disable @typescript-eslint/no-non-null-assertion, object-curly-newline */
import type { ChooksOption, DiscordOptionChoice } from 'chooksie/types';
import { ValidationResult, assert, inRange, testEach } from './tests';

export function validateChoice(
  choice: Partial<DiscordOptionChoice>,
): ValidationResult {
  return assert(
    typeof choice.name,
    type => type === 'string',
    'Invalid choice name!',
  ) ??
  assert(
    choice.name!.length ?? 0,
    inRange(1, 100),
    'Invalid name length!',
  ) ??
  assert(
    choice.value,
    value => typeof value === 'number' && !isNaN(value) ||
             typeof value === 'string' && inRange(1, 100, value.length),
    'Invalid choice value!',
  );
}

export function validateOptionChoices(
  option: Partial<ChooksOption>,
): ValidationResult {
  return assert(
    option.choices?.length ?? 0,
    inRange(0, 25),
    'Invalid choice list size!',
  ) ??
  assert(
    option.choices === undefined ? [] : option.choices,
    Array.isArray,
    'Invalid choice list type!',
  ) ??
  testEach(
    validateChoice,
    option.choices ?? [],
  );
}

export function validateOptionWithoutChoice(
  option: Partial<ChooksOption>,
): ValidationResult {
  return assert(
    option.choices,
    choices => choices === undefined,
    'Unexpected choices in option!',
  );
}
