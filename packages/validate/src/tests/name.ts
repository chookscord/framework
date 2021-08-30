import { assert, isType, testRegex } from '../tests';
import type { ValidationError } from '../types';

export function testName(name: string): ValidationError {
  return (
    assert(name, Boolean, 'Name does not exist!') ??
    assert(name, isType('string'), 'Name is not a string!')
  );
}

export function testCommandName(name: string): ValidationError {
  return (
    assert(name, testName) ??
    assert(name, testRegex(/^[\w-]{1,32}$/), 'Name does not match the regex pattern!')
  );
}
