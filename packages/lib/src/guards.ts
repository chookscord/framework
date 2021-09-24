import type { ChooksCommand, ChooksSlashCommand } from '@chookscord/types';
import { isType } from '@chookscord/validate';

export function isCommand(
  command: { type?: string },
): command is ChooksCommand {
  return isType('undefined', command.type) || command.type === 'CHAT_INPUT';
}

export function isSlashCommand(
  command: { type?: string; execute?: (...args: never[]) => unknown },
): command is ChooksSlashCommand {
  return isCommand(command) && isType('function', command.execute);
}
