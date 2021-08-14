import { Command, TextCommand } from '..';

export function isTextCommand(
  command: Command | TextCommand,
): command is TextCommand {
  return 'text' in command && command.text;
}

export function isCommand(
  command: Command | TextCommand,
): command is Command {
  return !isTextCommand(command);
}
