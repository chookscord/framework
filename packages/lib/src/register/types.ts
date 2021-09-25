/* eslint-disable camelcase */
export type RegisterCooldown = (now: number) => number | null;

export interface RegisterResponse {
  ok: boolean;
  onCooldown: RegisterCooldown;
  error: string | null;
}

export interface ErrorResponse {
  code: number;
  errors: Record<string, unknown>;
  message: string;
}

export interface RateLimitError {
  global: boolean;
  message: string;
  retry_after: number;
}

export interface DiscordError {
  code: string;
  message: string;
}
