import type { ChooksCommand, ChooksContextCommand, ChooksSlashCommand } from '@chookscord/types';
import { isType } from '@chookscord/validate';

export function isSlashCommand(
  command: ChooksCommand,
): command is ChooksSlashCommand {
  return (command.type ?? 'CHAT_INPUT') === 'CHAT_INPUT' && isType('function', command.execute);
}

export function isContextCommand(
  command: ChooksCommand,
): command is ChooksContextCommand {
  return (command.type === 'USER' || command.type === 'MESSAGE') &&
    isType('function', command.execute);
}
