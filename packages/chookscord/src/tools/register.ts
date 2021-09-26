/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as lib from '@chookscord/lib';
import type { ChooksCommand } from '@chookscord/types';

const logger = lib.createLogger('[cli] Register');
export async function registerCommands(
  register: lib.InteractionRegister,
  store: lib.Store<ChooksCommand>,
): Promise<lib.RegisterCooldown | null> {
  logger.info('Preparing commands...');
  const commands = lib.transformCommandList(store.getAll());
  logger.success(`Prepared ${commands.length} commands.`);

  try {
    logger.info(`Registering ${commands.length} commands...`);
    const res = await register(commands);

    if (res.ok) {
      logger.success(`Successfully registered ${commands.length} commands.`);
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
