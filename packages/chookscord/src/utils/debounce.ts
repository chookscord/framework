/* eslint-disable @typescript-eslint/no-shadow */
export function debounce<T extends [...args: unknown[]]>(
  fn: (...args: T) => unknown,
  ms: number
): typeof fn;
export function debounce<T extends [...args: unknown[]]>(
  fn: (...args: T) => unknown,
  ms: number,
  ...args: T
): () => unknown;
export function debounce<T extends [...args: unknown[]]>(
  fn: (...args: T) => unknown,
  ms: number,
  ...args: T
): typeof fn {
  let timeout: NodeJS.Timeout;
  return (...a) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(fn, ms, ...args.length ? args : a);
  };
}
