import * as lib from '@chookscord/lib';
import type { ChooksCommand, ChooksInteractionCommand } from '@chookscord/types';
import type { Config } from '../../types';
import { debounceAsync } from '../../utils';

export function createRegister(
  config: Config,
  store: lib.Store<ChooksCommand | ChooksInteractionCommand>,
  options: Partial<lib.Logger> = {},
): () => Promise<void> {
  const _register = lib.createInteractionRegister(
    {
      ...config.credentials,
      guildId: config.devServer,
    },
    options,
  );

  const register = debounceAsync(_register, 250);
  let cooldown: lib.GetCooldown;

  return async () => {
    const commands = lib.prepareCommands(store.getAll({ unique: true }));
    const res = await register(commands, cooldown);
    if (typeof res === 'function') {
      // eslint-disable-next-line require-atomic-updates
      cooldown = res;
    }
  };
}
