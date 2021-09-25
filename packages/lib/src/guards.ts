import type * as types from '@chookscord/types';
import { isType } from '@chookscord/validate';

// Maybe expose these somewhere, idk.
const TYPES_WITH_CHOICES: types.ChooksCommandOptionType[] = [
  'STRING',
  'INTEGER',
  'NUMBER',
];

const TYPES_WITHOUT_CHOICES: types.ChooksCommandOptionType[] = [
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
  return (command.type ?? 'CHAT_INPUT') === 'CHAT_INPUT' && isType('function', command.execute);
}

export function isContextCommand(
  command: types.ChooksCommand,
): command is types.ChooksContextCommand {
  return (command.type === 'USER' || command.type === 'MESSAGE') &&
    isType('function', command.execute);
}

export function isOptionWithChoice(
  option: types.ChooksCommandOption,
): option is types.ChooksCommandOptionWithChoice {
  return TYPES_WITH_CHOICES.includes(option.type);
}

export function isOptionWithoutChoice(
  option: types.ChooksCommandOption,
): option is types.ChooksCommandOptionWithoutChoice {
  return TYPES_WITHOUT_CHOICES.includes(option.type);
}
