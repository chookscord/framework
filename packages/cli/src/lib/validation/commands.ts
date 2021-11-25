/* eslint-disable @typescript-eslint/no-non-null-assertion, object-curly-newline */
import type { ChooksCommand, ChooksContextCommand, ChooksSlashCommand, ChooksSlashSubCommand } from 'chooksie/types';
import { ValidationResult, assert, inRange, testEach } from './tests';
import { testCommandName, testContextMenuName, testDescription } from './strings';
import { validateCommandOption, validateNonCommandOption } from './options';

function validateCommand(
  command: Partial<ChooksCommand>,
): ValidationResult {
  return assert(
    command.name,
    testCommandName,
  ) ??
  assert(
    command.description,
    testDescription,
  ) ??
  assert(
    command.type,
    type => type === undefined || type === 'CHAT_INPUT',
    'Invalid slash command type!',
  ) ??
  assert(
    command.options ?? [],
    Array.isArray,
    'Invalid slash command options!',
  ) ??
  assert(
    command.options?.length ?? 0,
    inRange(0, 25),
    'Slash command has too many options!',
  );
}

export function validateSlashCommand(
  command: Partial<ChooksSlashCommand>,
): ValidationResult {
  return assert(
    command,
    validateCommand,
  ) ??
  assert(
    typeof command.execute,
    type => type === 'function',
    'Invalid slash command handler!',
  ) ??
  assert(
    command.setup,
    setup => setup === undefined || typeof setup === 'function',
    'Invalid slash command setup!',
  ) ??
  testEach(
    validateNonCommandOption,
    command.options ?? [],
  );
}

export function validateSlashSubCommand(
  command: Partial<ChooksSlashSubCommand>,
): ValidationResult {
  return assert(
    command,
    validateCommand,
  ) ??
  assert(
    (command as ChooksSlashCommand).execute,
    handler => handler === undefined,
    'Unexpected handler in root of subcommands!',
  ) ??
  assert(
    (command as ChooksSlashCommand).setup,
    setup => setup === undefined,
    'Unexpected setup in root of subcommands!',
  ) ??
  assert(
    command.options?.length ?? 0,
    inRange(1, 25),
    'Missing subcommands list in slash command!',
  ) ??
  assert(
    command.options!,
    testEach(validateCommandOption),
  );
}

export function validateContextCommand(
  command: Partial<ChooksContextCommand>,
): ValidationResult {
  return assert(
    command.name,
    testContextMenuName,
  ) ??
  assert(
    command.type,
    type => type === 'MESSAGE' || type === 'USER',
    'Invalid context menu type!',
  ) ??
  assert(
    command.execute,
    handler => typeof handler === 'function',
    'Missing context menu handler!',
  ) ??
  assert(
    typeof command.setup,
    type => type === 'undefined' || type === 'function',
    'Invalid setup in context menu!',
  ) ??
  assert(
    (command as ChooksCommand).description,
    desc => desc === undefined,
    'Unexpected description in context menu!',
  ) ??
  assert(
    (command as ChooksCommand).options,
    options => options === undefined,
    'Unexpected options in context menu!',
  );
}
