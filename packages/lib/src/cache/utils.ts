let userUtils: Record<string, unknown> = {};

export function setUserUtils(utils: Record<string, unknown>): void {
  userUtils = utils;
}

export function getUtils<T = Record<string, unknown>>(): T {
  return userUtils as T;
}
