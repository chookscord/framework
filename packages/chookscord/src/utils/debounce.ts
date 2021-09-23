/* eslint-disable @typescript-eslint/no-shadow */
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

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number
): (...args: T) => Promise<UnwrapPromise<R>>;
export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number,
  ...args: T
): () => Promise<UnwrapPromise<R>>;
export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number,
  ...args: T
): (...args: T) => Promise<UnwrapPromise<R>> {
  let timeout: NodeJS.Timeout;
  return (...a) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    return new Promise(res => {
      timeout = setTimeout(
        (...args: T) => { res(fn(...args) as never) },
        ms,
        ...args.length ? args : a,
      );
    });
  };
}
