import type { ChooksCommand } from '@chookscord/types';
import type { Interaction } from 'discord.js';
import type { Store } from '@chookscord/lib/src/store';

export function createCommandKey(
  commandName: string,
  subCommandName?: string | null,
): string;
export function createCommandKey(
  commandName: string,
  groupName: string | null,
  subCommandName?: string | null,
): string;
export function createCommandKey(
  commandName: string,
  groupName: string | null = null,
  subCommandName: string | null = null,
): string {
  return [commandName, groupName, subCommandName]
    .filter(Boolean)
    .join('.');
}

export function resolveInteractionKey(interaction: Interaction): string | null {
  if (interaction.isCommand()) {
    const subCommandName = interaction.options.getSubcommand(false);
    const groupName = interaction.options.getSubcommandGroup(false);
    return createCommandKey(interaction.commandName, groupName, subCommandName);
  }

  if (interaction.isContextMenu()) {
    return createCommandKey(interaction.commandName);
  }

  return null;
}

export function resolveCommand(
  store: Store<ChooksCommand>,
  interaction: Interaction,
): ChooksCommand | null {
  const key = resolveInteractionKey(interaction);

  return key
    ? store.get(key)
    : null;
}
