/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { InteractionRegister, RegisterCooldown } from './register';
import type { ChooksCommand } from 'chooksie/types';
import { createLogger } from '@chookscord/logger';
import { transformCommandList } from './transform';

const logger = createLogger('[cli] Register');

export async function registerCommands(
  register: InteractionRegister,
  commands: Iterable<ChooksCommand>,
): Promise<RegisterCooldown | null> {
  logger.info('Preparing commands...');
  const interactions = transformCommandList(commands);
  logger.success(`Prepared ${interactions.length} commands.`);

  try {
    logger.info(`Registering ${interactions.length} commands...`);
    const res = await register(interactions);

    if (res.ok) {
      logger.success(`Successfully registered ${interactions.length} commands.`);
      return null;
    }

    logger.error(new Error(res.error!));
    return res.onCooldown;
  } catch (error) {
    logger.error('Failed to register commands!');
    logger.error(error);
    return null;
  }
}
