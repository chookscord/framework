import * as pc from 'picocolors';
import type { Logger } from './loggers';

export const __PREFIX = Symbol('prefix');
export type Prefix = { [__PREFIX]: string };

export const colors = [
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'gray',
] as const;

export function isPrefix(item: unknown): item is Prefix {
  return item !== null &&
    typeof item === 'object' &&
    __PREFIX in item;
}

export function createPrefix(prefix: string): Prefix {
  return { [__PREFIX]: prefix };
}

export function attachPrefix(logger: Logger, prefix: string): Logger {
  return logger.bind(null, createPrefix(prefix));
}

// @Choooks22: Its sole purpose is to get a number from a string
export function getTotalCharCode(string: string): number {
  let sum = 0;
  for (let i = 0, n = string.length; i < n; i++) {
    sum += string.charCodeAt(i);
  }
  return sum;
}

/**
 * Wraps a string with a random color.
 * @param string String to colorize
 * @returns Colorized string
 */
export function colorize(string: string): string {
  const index = getTotalCharCode(string) % colors.length;
  const color = colors[index];
  return pc[color](string);
}
