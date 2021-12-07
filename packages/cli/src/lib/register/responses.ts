import type { RegisterResponse } from './types';
import { flattenError } from './flatten-error';

export function ok(): RegisterResponse {
  return {
    ok: true,
    onCooldown: () => null,
    error: null,
  };
}

export function rateLimit(timestamp: number): RegisterResponse {
  return {
    ok: false,
    onCooldown: now => timestamp > now
      ? timestamp - now
      : null,
    error: 'You are being rate limited!',
  };
}

export function invalid(error: Record<string, unknown>): RegisterResponse {
  return {
    ok: false,
    onCooldown: () => null,
    error: Array
      .from(flattenError(error))
      .join('\n'),
  };
}
