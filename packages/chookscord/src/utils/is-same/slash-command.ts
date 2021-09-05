/* eslint-disable @typescript-eslint/no-non-null-assertion, complexity, array-bracket-newline */
import { BaseSlashCommand, CommandOption } from '@chookscord/lib';
import { keysAreSame } from './_object';

// @todo(Choooks22): TEMPORARY HACK: Create proper types pls
// lots of duplicated code, extract to functions
export function slashCommandOptionChanged(
  options: (CommandOption & { options?: CommandOption[] })[],
  oldOptions: (CommandOption & { options?: CommandOption[] })[],
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

    if (
      !option.options &&
      option.options !== oldOption.options
    ) {
      return true;
    }

    if (
      !Array.isArray(option.options) ||
      !Array.isArray(oldOption.options)
    ) {
      continue;
    }

    if (slashCommandOptionChanged(
      option.options,
      oldOption.options,
    )) {
      return true;
    }
  }

  return false;
}

export function slashCommandChanged(
  interaction: Omit<BaseSlashCommand, 'execute' | 'options'> & { options?: CommandOption[] },
  oldInteraction: Omit<BaseSlashCommand, 'execute' | 'options'> & { options?: CommandOption[] } | null,
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
