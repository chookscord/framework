/* eslint-disable @typescript-eslint/no-shadow */
import type { FlattenPromise } from './types';

export function debounce<T extends [...args: unknown[]]>(
  fn: (...args: T) => unknown,
  ms: number
): (...args: T) => void;
export function debounce<T extends [...args: unknown[]]>(
  fn: (...args: T) => unknown,
  ms: number,
  ...args: T
): () => void;
export function debounce<T extends [...args: unknown[]]>(
  fn: (...args: T) => unknown,
  ms: number,
  ...args: T
): (...args: T) => void {
  let timeout: NodeJS.Timeout;
  return (...a) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(fn, ms, ...args.length ? args : a);
  };
}

export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number
): (...args: T) => FlattenPromise<R>;
export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number,
  ...args: T
): () => FlattenPromise<R>;
export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number,
  ...args: T
): (...args: T) => FlattenPromise<R> {
  let timeout: NodeJS.Timeout;
  return (...a) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    return new Promise(res => {
      timeout = setTimeout(
        (...args: T) => { res(fn(...args)) },
        ms,
        ...args.length ? args : a,
      );
    }) as FlattenPromise<R>;
  };
}
