import type { Primitive, ValidationError } from './types';

export function inRange(min: number, max: number): (value: number) => boolean {
  return value => min <= value && value <= max;
}

export function isType<T>(type: Primitive): (value: T) => boolean {
  return value => typeof value === type;
}

export function assert<T>(value: T, test: (value: T) => ValidationError): ValidationError;
export function assert<T>(value: T, test: (value: T) => boolean, message: string): ValidationError;
export function assert<T>(value: T, test: (value: T) => (ValidationError | boolean), message?: string): ValidationError {
  return message
    ? test(value) ? null : message
    : test(value) as ValidationError;
}
