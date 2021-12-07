import type { DiscordError } from './types';

// eslint-disable-next-line complexity
export function *flattenError(error: Record<string, unknown>): Generator<string> {
  for (const key in error) {
    if (key === '_errors' && Array.isArray(error[key])) {
      for (const [i, err] of Object.entries(error[key] as DiscordError[])) {
        yield `${i}.${err.code} ${err.message}`;
      }
    } else if (typeof error[key] === 'object') {
      for (const nested of flattenError(error[key] as Record<string, unknown>)) {
        yield `${key}.${nested}`;
      }
    }
  }
}
