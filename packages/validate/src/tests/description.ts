import { inRange, isType } from '../tests';
import type { ValidationError } from '../types';
import { assert } from '..';

export function testDescription(desc: string): ValidationError {
  return (
    assert(desc, Boolean, 'Description does not exist!') ??
    assert(desc, isType('string'), 'Description is not a string!') ??
    assert(desc.length, inRange(1, 100), 'Description is too long!')
  );
}
