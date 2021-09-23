import type { Primitive } from './types';

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
