import type {
  Command,
  CommandGroup,
  SlashCommand,
  TextCommand,
} from '..';

export function isTextCommand(
  command: SlashCommand | TextCommand,
): command is TextCommand {
  return 'text' in command && command.text;
}

export function isCommand(
  command: SlashCommand | TextCommand,
): command is Command {
  return 'execute' in command && !isTextCommand(command);
}

export function isCommandGroup(
  command: SlashCommand,
): command is CommandGroup {
  if (isCommand(command) || !(0 in command.options)) {
    return false;
  }

  const { type } = command.options[0];
  return (
    type === 'SUB_COMMAND' ||
    type === 'SUB_COMMAND_GROUP'
  );
}
