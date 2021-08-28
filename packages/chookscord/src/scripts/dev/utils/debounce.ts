export function debounce<T extends [...args: unknown[]]>(
  fn: (...args: T) => unknown,
  ms: number,
): (...args: T) => unknown {
  let timeout: NodeJS.Timeout;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(fn, ms, ...args);
  };
}
