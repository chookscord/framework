/* eslint-disable require-atomic-updates, camelcase */
import * as chooks from '../types';
import * as prepare from './_prepare';
import * as routes from './_routes';
import { createLogger, fetch } from '../utils';
import { Response } from 'node-fetch';

export interface InteractionRegister {
  register: (commands: chooks.BaseApplicationCommand[]) => Promise<boolean>;
  prepare: (commands: Iterable<chooks.SlashCommand>) => chooks.BaseApplicationCommand[];
}

export interface InteractionRegisterConfig {
  token: string;
  applicationId: string;
  guildId?: string;
}

export interface RateLimitError {
  message: string;
  retry_after: number;
  global: boolean;
}

const logger = createLogger('[lib] Interaction Register');

async function getError(response: Response): Promise<RateLimitError | string | null> {
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

export function createInteractionRegister(
  config: InteractionRegisterConfig,
): InteractionRegister {
  logger.debug('Interaction Register created.');
  const route = config.guildId
    ? routes.guild(config.applicationId, config.guildId)
    : routes.global(config.applicationId);

  let retryAfter = 0;

  return {
    // @Choooks22: This pains me to add this here since it
    // doesn't technically need to be wrapped, but deal with it
    prepare(commands) {
      logger.info('Preparing commands...');
      let counter = 0;
      const preparedCommands: chooks.ApplicationSlashCommand[] = [];
      for (const command of commands) {
        const appCommand = prepare.command(command);
        preparedCommands.push(appCommand);
        logger.debug(`Prepared ${++counter} commands.`);
      }
      logger.info(`${counter} commands prepared.`);
      return preparedCommands;
    },
    // eslint-disable-next-line complexity
    async register(commands) {
      const cooldown = retryAfter - Date.now();
      if (cooldown > 0) {
        logger.warn(`You are still being rate limited! Retry after ${cooldown / 1000}s.`);
        return false;
      }

      logger.info(`Registering ${commands.length} commands...`);
      const response = await fetch(route, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bot ${config.token}`,
        },
        body: JSON.stringify(commands),
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
    },
  };
}
