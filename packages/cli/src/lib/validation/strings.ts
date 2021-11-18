/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-shadow */
import { ValidationResult, assert, inRange } from './tests';

// For any description
export function testDescription(desc?: string): ValidationResult {
  return assert(
    typeof desc,
    type => type === 'string',
    'Invalid description!',
  ) ??
  assert(
    desc!.length,
    inRange(1, 100),
    'Invalid description length!',
  );
}

// For slash commands and options
export function testCommandName(name?: string): ValidationResult {
  return assert(
    typeof name,
    type => type === 'string',
    'Invalid command name!',
  ) ??
  assert(
    [name!, name!.toLowerCase()] as const,
    ([original, lower]) => original === lower,
    'Command names cannot have uppercase characters!',
  ) ??
  assert(
    name!,
    name => /^[\w-]{1,32}$/u.test(name),
    'Command name does not match the pattern!',
  );
}

// For context menus
export function testContextMenuName(name?: string): ValidationResult {
  return assert(
    typeof name,
    type => type === 'string',
    'Invalid context menu name!',
  ) ??
  assert(
    name!,
    name => /^[ \w-]{1,32}$/u.test(name),
    'Context menu name does not match the pattern!',
  );
}
