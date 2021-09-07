/* eslint-disable camelcase */
import type { Response } from 'node-fetch';

interface BaseError {
  code: number;
  message: string;
}

export interface RateLimitError extends BaseError {
  retry_after: number;
  global: boolean;
}

export interface RegisterError extends BaseError {
  errors: unknown; // Somewhere down there, RegisterErrorMessage exists.
}

export interface RegisterErrorMessage {
  code: string;
  message: string;
}

export function isRateLimitError(
  error: BaseError,
): error is RateLimitError {
  return 'retry_after' in error;
}

export function isRegisterError(
  error: BaseError,
): error is RegisterError {
  return 'errors' in error;
}

// Stupid hack because for some reason Discord returns some nested trash
function extractErrorMesage(
  error: RegisterError,
): RegisterErrorMessage | null {
  try {
    let current = Object.values(error.errors as never)[0];
    while (!Array.isArray(current)) {
      current = Object.values(current as never)[0];
    }
    return current[0];
  } catch {
    return null;
  }
}

// eslint-disable-next-line complexity
export async function getError(
  response: Response,
): Promise<RateLimitError | string | null> {
  try {
    const error = await response.json() as BaseError;
    if (isRateLimitError(error)) {
      return error;
    }

    if (isRegisterError(error)) {
      return extractErrorMesage(error)?.message ?? null;
    }

    return error.message ?? null;
  } catch {
    return null;
  }
}
