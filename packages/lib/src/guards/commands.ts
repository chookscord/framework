import type {
  BaseSlashCommand,
  SlashCommand,
  SlashSubCommand,
  SlashSubCommandGroup,
} from '../types';

export function isSlashCommand(
  command: SlashCommand,
): command is BaseSlashCommand {
  return 'execute' in command && typeof command.execute === 'function';
}

export function isSlashSubCommand(
  command: SlashCommand,
): command is SlashSubCommand {
  if (isSlashCommand(command) || !Array.isArray(command.options)) {
    return false;
  }

  return command.options[0]?.type !== 'SUB_COMMAND';
}

// eslint-disable-next-line complexity
export function isGroupSlashCommand(
  command: SlashCommand,
): command is SlashSubCommandGroup {
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
