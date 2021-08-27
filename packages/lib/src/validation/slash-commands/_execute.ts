import { Command } from '../../types';

export function commandHasExecute(command: Command): boolean {
  return 'execute' in command && typeof command.execute === 'function';
}
