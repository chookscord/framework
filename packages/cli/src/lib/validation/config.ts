import type { BotCredentials, Config } from 'chooksie';
import { ValidationResult, assert } from './tests';

export function validateBotCredentials(
  credentials: Partial<BotCredentials>,
): ValidationResult {
  return assert(
    credentials?.token,
    token => typeof token === 'string',
    'Missing bot token!',
  ) ??
  assert(
    credentials?.applicationId,
    id => typeof id === 'string',
    'Missing application id!',
  );
}

export function validateProdConfig(
  config: Partial<Config>,
): ValidationResult {
  return assert(
    config.credentials ?? {},
    validateBotCredentials,
  ) ?? assert(
    config.intents,
    Array.isArray,
    'Missing client intents!',
  );
}

export function validateDevConfig(
  config: Partial<Config>,
): ValidationResult {
  return assert(
    config,
    validateProdConfig,
  ) ??
  assert(
    config.devServer,
    guildId => typeof guildId === 'string',
    'Missing dev guild id!',
  );
}
