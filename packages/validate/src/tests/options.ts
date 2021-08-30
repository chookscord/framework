import { assert, inRange, isType } from '../tests';
import type { ValidationError } from '../types';

function validateType(context: string, type: number, max: number): ValidationError {
  return (
    assert(type, isType('number'), `${context} type is not a number!`) ??
    assert(type, inRange(1, max), `${context} type is not valid!`)
  );
}

export function testCommandType(type: number): ValidationError {
  return validateType('Command', type, 3);
}

export function testOptionType(type: number): ValidationError {
  return validateType('Option', type, 10);
}
