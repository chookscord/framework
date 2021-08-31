/* eslint-disable @typescript-eslint/no-non-null-assertion, complexity, array-bracket-newline */
import { BaseSlashCommand, NonCommandOption } from '@chookscord/lib';
import { keysAreSame } from './_object';

export function slashCommandOptionChanged(
  options: NonCommandOption[],
  oldOptions: NonCommandOption[],
): boolean {
  if (options.length !== oldOptions.length) {
    return true;
  }

  for (let i = 0, n = options.length; i < n; i++) {
    const option = options[i];
    const oldOption = oldOptions[i];

    if (!keysAreSame(option, oldOption, ['name', 'description', 'type', 'required'])) {
      return true;
    }
  }

  return false;
}

export function slashCommandChanged(
  interaction: BaseSlashCommand,
  oldInteraction: BaseSlashCommand | null,
): boolean {
  if (!oldInteraction) {
    return true;
  }

  if (
    interaction.name !== oldInteraction.name ||
    interaction.description !== oldInteraction.description
  ) {
    return true;
  }

  if (
    !interaction.options &&
    interaction.options !== oldInteraction.options
  ) {
    return true;
  }

  const newIsArray = Array.isArray(interaction.options);
  const oldIsArray = Array.isArray(oldInteraction.options);

  if (newIsArray !== oldIsArray) {
    return true;
  }

  if (!newIsArray && !oldIsArray) {
    return false;
  }

  return slashCommandOptionChanged(
    interaction.options!,
    oldInteraction.options!,
  );
}
