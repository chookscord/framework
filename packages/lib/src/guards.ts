import type * as types from './types';

export function isSlashCommand(
  command: types.SlashCommand,
): command is types.BaseSlashCommand {
  return 'execute' in command && typeof command.execute === 'function';
}

export function isSlashSubCommand(
  command: types.SlashCommand,
): command is types.SlashSubCommand {
  if (isSlashCommand(command) || !Array.isArray(command.options)) {
    return false;
  }

  return command.options[0]?.type !== 'SUB_COMMAND';
}

// eslint-disable-next-line complexity
export function isGroupSlashCommand(
  command: types.SlashCommand,
): command is types.SlashSubCommandGroup {
  if (isSlashCommand(command) || isSlashSubCommand(command)) {
    return false;
  }

  const group = command.options[0];
  if (group.type !== 'SUB_COMMAND_GROUP' || !Array.isArray(group.options)) {
    return false;
  }

  const subCommand = group.options[0];
  return subCommand.type === 'SUB_COMMAND' && isSlashCommand(subCommand);
}
