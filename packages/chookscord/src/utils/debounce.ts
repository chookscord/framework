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

export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number
): (...args: T) => Promise<Awaited<R>>;
export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number,
  ...args: T
): () => Promise<Awaited<R>>;
export function debounceAsync<T extends [...args: unknown[]], R>(
  fn: (...args: T) => R,
  ms: number,
  ...args: T
): (...args: T) => Promise<Awaited<R>> {
  let timeout: NodeJS.Timeout;
  return (...a) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    return new Promise(res => {
      timeout = setTimeout(
        (...args: T) => { res(fn(...args) as Awaited<R>) },
        ms,
        ...args.length ? args : a,
      );
    });
  };
}
