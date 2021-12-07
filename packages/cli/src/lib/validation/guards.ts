import type * as types from 'chooksie/types';

// @Choooks22: Maybe expose these somewhere, idk.
const TYPES_WITH_CHOICES: types.ChooksOptionType[] = [
  'STRING',
  'INTEGER',
  'NUMBER',
];

const TYPES_WITHOUT_CHOICES: types.ChooksOptionType[] = [
  'BOOLEAN',
  'CHANNEL',
  'MENTIONABLE',
  'ROLE',
  'SUB_COMMAND',
  'SUB_COMMAND_GROUP',
  'USER',
];

export function isSlashCommand(
  command: types.ChooksCommand,
): command is types.ChooksSlashCommand {
  return (command.type ?? 'CHAT_INPUT') === 'CHAT_INPUT' &&
    typeof command.execute === 'function';
}

export function isContextMenuCommand(
  command: types.ChooksCommand,
): command is types.ChooksContextCommand {
  return (command.type === 'USER' || command.type === 'MESSAGE') &&
    typeof command.execute === 'function';
}

export function isOptionWithChoice(
  option: types.ChooksOption,
): option is types.ChooksOptionWithChoice {
  return TYPES_WITH_CHOICES.includes(option.type);
}

export function isOptionWithoutChoice(
  option: types.ChooksOption,
): option is types.ChooksOptionWithoutChoice {
  return TYPES_WITHOUT_CHOICES.includes(option.type);
}

export function isSubCommandOption(
  option: types.ChooksOption,
): option is types.ChooksSubCommandOption {
  return option.type === 'SUB_COMMAND';
}

export function isGroupOption(
  option: types.ChooksOption,
): option is types.ChooksCommandGroupOption {
  return option.type === 'SUB_COMMAND_GROUP';
}

export function isNonCommandOption(
  option: types.ChooksOption,
): option is types.ChooksNonCommandOption {
  return !isSubCommandOption(option) && !isGroupOption(option);
}
