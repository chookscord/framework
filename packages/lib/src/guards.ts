import type { ChooksCommand, ChooksInteractionCommand, ChooksSlashCommand } from '@chookscord/types';
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

export function isInteraction(
  command: { type?: string; execute?: (...args: never[]) => unknown },
): command is ChooksInteractionCommand {
  return (command.type === 'USER' || command.type === 'MESSAGE') &&
    isType('function', command.execute);
}
