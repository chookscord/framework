import type { ValidationError } from './types';
import { isType } from './utils';

export function assert<T>(
  value: T,
  test: (value: T) => ValidationError
): ValidationError;
export function assert<T>(
  value: T,
  test: (value: T) => boolean,
  message: string
): ValidationError;
export function assert<T>(
  value: T,
  test: (value: T) => (ValidationError | boolean),
  message?: string,
): ValidationError {
  return arguments.length === 3
    ? test(value) ? null : message!
    : test(value) as ValidationError;
}

export function testEach<T>(
  validate: (option: T) => ValidationError,
): (options: T[]) => ValidationError;
export function testEach<T>(
  validate: (option: T) => ValidationError,
  list: T[],
): ValidationError;
export function testEach<T>(
  validate: (option: T) => ValidationError,
  list?: T[],
): ValidationError | ((options: T[]) => ValidationError) {
  if (!list) {
    return x => testEach(validate, x);
  }

  const errors = list.map(validate);
  return errors.some(isType('string'))
    ? errors.reduce(
      (messages, message, i) => message
        ? `${messages}\n  [${i}] ${message}`
        : messages,
      'Errors:',
    )
    : null;
}
