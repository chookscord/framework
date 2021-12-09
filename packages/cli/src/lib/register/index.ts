/* eslint-disable @typescript-eslint/no-non-null-assertion, require-atomic-updates */
import * as routes from './routes';
import { DiscordSlashCommand } from 'chooksie/types';
import { WrappedRequest } from '@chookscord/fetch';
import { chooksie } from '../../lib';
import { createLogger } from '@chookscord/logger';
import { register } from './register';

export type { RegisterCooldown, RegisterResponse } from './types';

const logger = createLogger('[chooks] register');

export type InteractionRegister = (interactions: DiscordSlashCommand[]) => Promise<InteractionRegister>;
export interface RegisterConfig {
  token: string;
  applicationId: string;
  guildId?: string;
}

export function registerCommands(
  config: RegisterConfig,
  interactions: DiscordSlashCommand[],
): WrappedRequest {
  const route = config.guildId
    ? routes.guild(config.applicationId, config.guildId)
    : routes.global(config.applicationId);

  return register(route, config.token, interactions);
}

export function createRegister(config: RegisterConfig): InteractionRegister {
  const route = config.guildId
    ? routes.guild(config.applicationId, config.guildId)
    : routes.global(config.applicationId);

  let next: number | null = null;
  let timeout: NodeJS.Timeout;

  const _register: InteractionRegister = async interactions => {
    if (next !== null) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        next = null;
        clearTimeout(timeout);
        _register(interactions);
      }, next - Date.now());

      return _register;
    }

    const response = await register(route, config.token, interactions);
    const remaining = Number(response.headers.get('X-RateLimit-Remaining'));

    if (remaining === 0) {
      const timestamp = response.headers.get('X-RateLimit-Reset-After')!;
      const resetAfter = parseFloat(timestamp!) * 1000;
      next = Date.now() + resetAfter;

      if (response.status === 429) {
        logger.error('Rate limit reached!');
      } else {
        logger.success('Successfully registered.');
      }

      logger.info(`Next register: ${chooksie.chrono.formatTime(resetAfter)}`);
      return _register;
    }

    logger.success('Successfully registered.');
    logger.info('Next register: now');
    return _register;
  };

  logger.debug('Interaction Register created.');
  return _register;
}
