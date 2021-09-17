import type * as types from '@chookscord/types';
import type { CommandInteraction } from 'discord.js';
import type { Store } from '../../store';

export function resolveCommand(
  store: Store<types.ChooksCommand>,
  interaction: CommandInteraction,
): types.ChooksCommand | null {
  // @todo(Choooks22): Extract to command store key getter
  const commandName = interaction.commandName;
  const groupName = interaction.options.getSubcommandGroup(false);
  const subCommandName = interaction.options.getSubcommand(false);

  const storeKey = [commandName, groupName, subCommandName]
    .filter(Boolean)
    .join(' ');

  return store.get(storeKey);
}
