import type * as types from '@chookscord/types';
import type { CommandInteraction } from 'discord.js';
import type { Store } from '../../store';
import { createCommandKey } from '.';

export function resolveCommand(
  store: Store<types.ChooksCommand>,
  interaction: CommandInteraction,
): types.ChooksCommand | null {
  const key = createCommandKey(
    interaction.commandName,
    interaction.options.getSubcommandGroup(false),
    interaction.options.getSubcommand(false),
  );

  return store.get(key);
}
