import type { Interaction } from 'discord.js';

export function createCommandKey(
  ...names: [string, (string | null)?, (string | null)?]
): string {
  return names
    .filter(name => typeof name === 'string')
    .join('.');
}

export function resolveCommandKey(interaction: Interaction): string | null {
  if (interaction.isContextMenu()) {
    return interaction.commandName;
  }

  if (interaction.isCommand()) {
    return createCommandKey(
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false),
    );
  }

  return null;
}
