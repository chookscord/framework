import * as validate from '@chookscord/validate';
import { Config } from '../types';

export function validateConfig(config: Config, isDev: boolean): validate.ValidationError {
  return validate.assert(
    [config.credentials?.applicationId, config.credentials?.token],
    validate.testEach(
      credential => validate.isType('string', credential) && credential.length
        ? null
        : 'Missing credentials!',
    ),
  ) ??
  validate.assert(
    config.devServer,
    id => isDev && validate.isType('string', id) && id?.length
      ? 'Missing dev guild id!'
      : null,
  ) ??
  validate.assert(
    config.intents,
    Array.isArray,
    'Missing client intents!',
  );
}
