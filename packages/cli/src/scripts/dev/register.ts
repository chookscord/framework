/* eslint-disable require-atomic-updates */
import type { ChooksCommand } from '@chookscord/types';

const logger = lib.createLogger('[cli] Register');

export function createRegister(
  config: ChooksConfig,
  store: lib.Store<ChooksCommand>,
): () => Promise<void> {
  const _register = lib.createRegister({
    ...config.credentials,
    guildId: config.devServer,
  });

  const register = debounceAsync(registerCommands, 250, _register, store);
  let onCooldown: lib.RegisterCooldown = () => null;

  return async () => {
    const cooldown = onCooldown(Date.now());
    if (cooldown) {
      logger.warn(`You are still under rate limit! Try again in ${cooldown / 1000}s.`);
      return;
    }

    const result = await register();
    if (!result.aborted && result.data) {
      onCooldown = result.data;
    }
  };
}
