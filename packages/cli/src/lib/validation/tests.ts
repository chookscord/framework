/* eslint-disable @typescript-eslint/no-non-null-assertion */
export type ValidationResult = string | null;

/**
 * Test a value and return an error message if it doesn't pass.
 */
export function assert<T>(
  value: T,
  test: (value: T) => ValidationResult
): ValidationResult;
export function assert<T>(
  value: T,
  test: (value: T) => boolean,
  message: string
): ValidationResult;
export function assert<T>(
  value: T,
  test: (value: T) => (ValidationResult | boolean),
  message?: string,
): ValidationResult {
  return arguments.length === 3
    ? test(value) ? null : message!
    : test(value) as ValidationResult;
}

/**
 * Test each value in an array and return all error messages.
 */
export function testEach<T>(
  validate: (option: T) => ValidationResult,
): (options: T[]) => ValidationResult;
export function testEach<T>(
  validate: (option: T) => ValidationResult,
  list: T[],
): ValidationResult;
export function testEach<T>(
  validate: (option: T) => ValidationResult,
  list?: T[],
): ((options: T[]) => ValidationResult) | ValidationResult {
  if (!list) {
    return (x: T[]) => testEach(validate, x);
  }

  const errors = list.map(validate);
  return errors.some(x => typeof x === 'string')
    ? errors.reduce(
      (messages, message, i) => message
        ? `${messages}\n  [${i}] ${message}`
        : messages,
      'Errors:',
    )
    : null;
}

/**
 * Test if the value is less than a number.
 */
export function lt(
  value: number,
): (min: number) => boolean;
export function lt(
  value: number,
  min: number,
): boolean;
export function lt(
  value: number,
  min?: number,
): ((min: number) => boolean) | boolean {
  return arguments.length === 1
    ? x => lt(value, x)
    : value < min!;
}

/**
 * Test if the value is greater than a number.
 */
export function gt(
  value: number,
): (max: number) => boolean;
export function gt(
  value: number,
  max: number,
): boolean;
export function gt(
  value: number,
  max?: number,
): ((max: number) => boolean) | boolean {
  return arguments.length === 1
    ? x => gt(value, x)
    : value > max!;
}

/**
 * Test if a number is in a range inclusively.
 */
export function inRange(
  min: number,
  max: number,
): (value: number) => boolean;
export function inRange(
  min: number,
  max: number,
  value: number
): boolean;
export function inRange(
  min: number,
  max: number,
  value?: number,
): ((value: number) => boolean) | boolean {
  return arguments.length === 3
    ? min <= value! && value! <= max
    : x => inRange(min, max, x);
}
