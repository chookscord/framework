/* eslint-disable complexity, require-atomic-updates */
import * as routes from './_routes';
import type * as types from '../types';
import { RateLimitError, getError } from './_error';
import { logger } from './_logger';
import { registerCommands } from './_register';

export type RegisterInteraction = (
  commands: types.BaseApplicationCommand[]
) => Promise<boolean>;

export interface InteractionRegisterConfig {
  token: string;
  applicationId: string;
  guildId?: string;
}

export function createInteractionRegister(
  config: InteractionRegisterConfig,
): RegisterInteraction {
  logger.debug('Interaction Register created.');
  const route = config.guildId
    ? routes.guild(config.applicationId, config.guildId)
    : routes.global(config.applicationId);

  let retryAfter = 0;
  return async commands => {
    const cooldown = retryAfter - Date.now();
    if (cooldown > 0) {
      logger.warn(`You are still being rate limited! Retry after ${cooldown / 1000}s.`);
      return false;
    }

    logger.info(`Registering ${commands.length} commands...`);
    logger.debug('Route:', route);
    const response = await registerCommands({
      route,
      token: config.token,
      commands,
    });

    logger.debug(`Status: ${response.status} ${response.statusText}`);
    logger.debug(`OK: ${response.ok}`);
    if (response.ok) {
      logger.info(`${commands.length} commands successfully registered.`);
      return true;
    }

    logger.error('Failed to register interactions!');
    if (response.status === 429) {
      const error = await getError(response) as RateLimitError;
      logger.error(`${error.message} Retry after: ${error.retry_after}s.`);
      retryAfter = Date.now() + error.retry_after * 1000;
    }

    const error = await getError(response);
    if (error) logger.error(error);

    return false;
  };
}
