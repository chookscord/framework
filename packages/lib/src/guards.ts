import type { ChooksCommand, ChooksSlashCommand, ChooksSubCommand } from '@chookscord/types';
import { commandHasExecute } from './validation/slash-commands/_execute';

export function isCommand(
  command: { type?: string },
): command is ChooksCommand {
  return !command.type || command.type === 'CHAT_INPUT';
}

export function isSlashCommand(
  command: ChooksCommand,
): command is ChooksSlashCommand {
  return isCommand(command) && commandHasExecute(command);
}

export function isSubCommand(
  command: ChooksCommand,
): command is ChooksSubCommand {
  return !isSlashCommand(command) && command.options?.[0].type === 'SUB_COMMAND';
}
