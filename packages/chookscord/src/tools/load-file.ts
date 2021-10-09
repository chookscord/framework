import type { Awaitable } from 'discord.js';

export type LoadResult<T, R> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: R;
};

export async function loadFile<T, P, R>(
  importer: (path: P) => T | Awaitable<T>,
  path: P,
  validate?: (value: T) => R,
): Promise<LoadResult<T, R | Error>> {
  try {
    const data = await importer(path);
    const error = validate?.(data);
    return error
      ? { ok: false, error }
      : { ok: true, data };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
