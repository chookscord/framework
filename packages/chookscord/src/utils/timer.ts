export function createTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}
