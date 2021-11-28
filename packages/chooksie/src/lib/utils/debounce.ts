/* eslint-disable @typescript-eslint/no-shadow */
import * as timers from 'timers/promises';
import type { TimerOptions } from 'timers';

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

export type Debounced<T> =
  { data: T; aborted: false } |
  { data: null; aborted: true };

export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  delay: number
): (...args: T) => Promise<Debounced<Awaited<R>>>;
export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  delay: number,
  ...args: T
): () => Promise<Debounced<Awaited<R>>>;
export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  delay: number,
  ...args: T
): (...args: T) => Promise<Debounced<R>> {
  let controller: AbortController;

  // eslint-disable-next-line complexity
  return async (..._args) => {
    if (controller) {
      controller.abort();
    }

    controller = new AbortController();
    const options: TimerOptions = { signal: controller.signal };

    try {
      const cb = await timers.setTimeout(delay, fn, options);
      const data = await cb(...args.length ? args : _args);
      return { data, aborted: false };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { data: null, aborted: true };
      }
      throw error;
    }
  };
}
