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
  return value
    ? regex.test(value)
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
  return value
    ? min <= value && value <= max
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
  return value
    ? typeof value === type
    : x => isType(type, x);
}

export function assert<T>(value: T, test: (value: T) => ValidationError): ValidationError;
export function assert<T>(value: T, test: (value: T) => boolean, message: string): ValidationError;
export function assert<T>(value: T, test: (value: T) => (ValidationError | boolean), message?: string): ValidationError {
  return message
    ? test(value) ? null : message
    : test(value) as ValidationError;
}
