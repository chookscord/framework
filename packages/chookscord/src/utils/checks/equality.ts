export function eq<A, B extends A>(a: A, b: B): a is B {
  return a === b;
}

export function eachBoth<T>(
  a: T[],
  b: T[],
  check: (a: T, b: T) => boolean,
): boolean {
  for (let i = 0, n = a.length; i < n; i++) {
    if (check(a[i], b[i])) return true;
  }
  return false;
}

export function keysAreSame<T>(
  a: T,
  b: T,
  keys: (keyof T)[],
): boolean {
  return keys.every(key => eq(a[key], b[key]));
}
