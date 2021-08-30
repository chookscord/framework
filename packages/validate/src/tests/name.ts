import type { ValidationError } from '../types';
import { assert } from '..';
import { isType } from '../tests';

export function testName(name: string): ValidationError {
  return (
    assert(name, Boolean, 'Name does not exist!') ??
    assert(name, isType('string'), 'Name is not a string!')
  );
}

export function testCommandName(name: string): ValidationError {
  return (
    assert(name, testName) ??
    assert(name, /^[\w-]{1,32}$/.test, 'Name does not match the regex pattern!')
  );
}
