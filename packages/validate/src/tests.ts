/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Primitive, ValidationError } from './types';

export function testRegex(
  regex: RegExp
): (value: string) => boolean;
export function testRegex(
  regex: RegExp,
  value: string
): boolean;
export function testRegex(
  regex: RegExp,
  value?: string,
): boolean | ((value: string) => boolean) {
  return arguments.length === 2
    ? regex.test(value!)
    : x => testRegex(regex, x);
}

export function inRange(
  min: number,
  max: number,
  value: number
): boolean;
export function inRange(
  min: number,
  max: number,
): (value: number) => boolean;
export function inRange(
  min: number,
  max: number,
  value?: number,
): boolean | ((value: number) => boolean) {
  return arguments.length === 3
    ? min <= value! && value! <= max
    : x => inRange(min, max, x);
}

export function isType<T>(
  type: Primitive
): (value: T) => boolean;
export function isType<T>(
  type: Primitive,
  value: T,
): boolean;
export function isType<T>(
  type: Primitive,
  value?: T,
): boolean | ((value: T) => boolean) {
  return arguments.length === 2
    ? typeof value === type
    : x => isType(type, x);
}

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
