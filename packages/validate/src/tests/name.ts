import { assert, isType, testRegex } from '../tests';
import type { ValidationError } from '../types';

export function testName(name: string): ValidationError {
  return (
    assert(name, Boolean, 'Name does not exist!') ??
    assert(name, isType('string'), 'Name is not a string!')
  );
}

export function testInteractionName(name: string): ValidationError {
  return (
    assert(name, testName) ??
    assert(name, testRegex(/^[\w-]{1,32}$/u), 'Name does not match the regex pattern!')
  );
}

// This only tests uppercase English letters, not sure about other uppercase letters in
// different locales but its better to get an error rather than falsely blocking.
export function testCommandName(name: string): ValidationError {
  return (
    assert(name, testInteractionName) ??
    assert(name, testRegex(/[A-Z]/), 'Name must not have uppercase letters!')
  );
}
