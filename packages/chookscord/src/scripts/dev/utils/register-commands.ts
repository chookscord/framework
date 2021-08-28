import * as lib from '@chookscord/lib';

const logger = lib.createLogger('[cli] Register');
export async function registerCommands(
  register: lib.InteractionRegister,
  store: lib.CommandStore<lib.BaseSlashCommand>,
): Promise<void> {
  logger.info('Preparing commands...');
  const commands = register.prepare(store.getAll());
  logger.success(`Prepared ${commands.length}`);
  try {
    logger.info(`Registering ${commands.length} commands...`);
    const ok = await register.register(commands);
    if (ok) {
      logger.success(`Successfully registered ${commands.length} commands.`);
    } else {
      logger.warn('Could not register commands.');
    }
  } catch (error) {
    logger.error('Failed to register commands!');
    logger.error(error);
  }
}
