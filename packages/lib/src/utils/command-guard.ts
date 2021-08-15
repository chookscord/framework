import { Command, SlashCommand, TextCommand } from '..';

export function isTextCommand(
  command: SlashCommand | TextCommand,
): command is TextCommand {
  return 'text' in command && command.text;
}

export function isCommand(
  command: SlashCommand | TextCommand,
): command is Command {
  return !isTextCommand(command);
}
