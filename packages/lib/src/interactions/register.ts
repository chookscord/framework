import * as chooks from '../types';
import * as prepare from './_prepare';
import * as routes from './_routes';
import { createLogger, fetch } from '../utils';

export interface InteractionRegister {
  register: (commands: chooks.BaseApplicationCommand[]) => Promise<boolean>;
  prepare: (commands: Iterable<chooks.SlashCommand>) => chooks.BaseApplicationCommand[];
}

export interface InteractionRegisterConfig {
  token: string;
  applicationId: string;
  guildId?: string;
}

const logger = createLogger('[lib] Interaction Register');

export function createInteractionRegister(
  config: InteractionRegisterConfig,
): InteractionRegister {
  logger.debug('Interaction Register created.');
  const route = config.guildId
    ? routes.guild(config.applicationId, config.guildId)
    : routes.global(config.applicationId);

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
    async register(commands) {
      logger.info(`Registering ${commands.length} commands...`);
      const response = await fetch(route, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bot ${config.token}`,
        },
        body: JSON.stringify(commands),
      });

      if (response.ok) {
        logger.info(`${commands.length} commands successfully registered.`);
      } else {
        try {
          const data = await response.json();
          logger.error(data.errors);
        } finally {
          logger.error('Failed to register interactions!');
        }
      }

      return response.ok;
    },
  };
}
