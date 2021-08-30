/* eslint-disable camelcase */
import type { Response } from 'node-fetch';

export interface RateLimitError {
  message: string;
  retry_after: number;
  global: boolean;
}

export async function getError(
  response: Response,
): Promise<RateLimitError | string | null> {
  try {
    const error = await response.json();
    if ('retry_after' in error) {
      return error;
    }

    return error.message ?? null;
  } catch {
    return null;
  }
}
