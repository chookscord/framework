/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-shadow, object-curly-newline */
import type { ChooksCommandGroupOption, ChooksOption, ChooksSubCommandOption } from 'chooksie/types';
import { ValidationResult, assert, inRange, testEach } from './tests';
import { isOptionWithChoice, isOptionWithoutChoice } from './guards';
import { testCommandName, testDescription } from './strings';
import { validateOptionChoices, validateOptionWithoutChoice } from './choices';

function validateOption(
  option: Partial<ChooksOption>,
): ValidationResult {
  return assert(
    option,
    option => option !== undefined && option !== null,
    'Invalid option!',
  ) ??
  assert(
    option.name,
    testCommandName,
  ) ??
  assert(
    option.description,
    testDescription,
  );
}

export function validateNonCommandOption(
  option: Partial<ChooksOption>,
): ValidationResult {
  return assert(
    option,
    validateOption,
  ) ??
  assert(
    option.options,
    options => options === undefined,
    'Unexpected options in option!',
  ) ??
  assert(
    option.type,
    type => type !== 'SUB_COMMAND' && type !== 'SUB_COMMAND_GROUP',
    'Invalid option type!',
  ) ??
  assert(
    option as ChooksOption,
    option => {
      if (isOptionWithChoice(option)) {
        return validateOptionChoices(option);
      }

      if (isOptionWithoutChoice(option)) {
        return validateOptionWithoutChoice(option);
      }

      return 'Invalid option type!';
    },
  );
}

export function validateSubCommand(
  option: Partial<ChooksOption | ChooksSubCommandOption>,
): ValidationResult {
  return assert(
    option,
    validateOption,
  ) ??
  assert(
    option.type,
    type => type === 'SUB_COMMAND',
    'Invalid subcommand type!',
  ) ??
  assert(
    (option as ChooksSubCommandOption).execute,
    handler => typeof handler === 'function',
    'Invalid subcommand handler!',
  ) ??
  assert(
    typeof (option as ChooksSubCommandOption).setup,
    type => type === 'undefined' || type === 'function',
    'Invalid subcommand setup type!',
  ) ??
  assert(
    (option as ChooksOption).choices,
    choices => choices === undefined,
    'Unexpected choice list in subcommand!',
  ) ??
  assert(
    option.options === undefined ? [] : option.options,
    Array.isArray,
    'Invalid subcommand option choices!',
  ) ??
  assert(
    option.options?.length ?? 0,
    inRange(0, 25),
    'Invalid subcommand options size!',
  ) ??
  testEach(
    validateNonCommandOption,
    option.options ?? [],
  );
}

export function validateSubCommandGroup(
  option: Partial<ChooksOption | ChooksCommandGroupOption>,
): ValidationResult {
  return assert(
    option,
    validateOption,
  ) ??
  assert(
    option.type,
    type => type === 'SUB_COMMAND_GROUP',
    'Invalid subcommand group type!',
  ) ??
  assert(
    option.options,
    Array.isArray,
    'Missing subcommands in subcommand group!',
  ) ??
  assert(
    option.options!.length,
    inRange(1, 25),
    'Invalid subcommand size in subcommand group!',
  ) ??
  assert(
    (option as ChooksSubCommandOption).execute,
    handler => handler === undefined,
    'Unexpected handler in subcommand group!',
  ) ??
  assert(
    (option as ChooksSubCommandOption).setup,
    setup => setup === undefined,
    'Unexpected setup in subcommand group!',
  ) ??
  assert(
    (option as ChooksOption).choices,
    choices => choices === undefined,
    'Unexpected choice list in subcommand group!',
  ) ??
  testEach(
    validateSubCommand,
    option.options!,
  );
}

export function validateCommandOption(
  option: Partial<ChooksOption | ChooksSubCommandOption | ChooksCommandGroupOption>,
): ValidationResult {
  return assert(
    option,
    option => {
      if (option.type === 'SUB_COMMAND') {
        return validateSubCommand(option);
      }

      if (option.type === 'SUB_COMMAND_GROUP') {
        return validateSubCommandGroup(option);
      }

      return 'Invalid subcommand option type!';
    },
  );
}
