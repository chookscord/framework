import type { ChooksCommand, ChooksSlashCommand, ChooksSubCommand } from '@chookscord/types';
import { isType } from '@chookscord/validate';

export function isCommand(
  command: { type?: string },
): command is ChooksCommand {
  return isType('undefined', command.type) || command.type === 'CHAT_INPUT';
}

export function isSlashCommand(
  command: ChooksCommand,
): command is ChooksSlashCommand {
  return isCommand(command) && isType('function', command.execute);
}

export function isSubCommand(
  command: ChooksCommand,
): command is ChooksSubCommand {
  return !isSlashCommand(command) && command.options?.[0].type === 'SUB_COMMAND';
}
