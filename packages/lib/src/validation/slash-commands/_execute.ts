export function commandHasExecute<T extends { execute?: unknown }>(command: T): boolean {
  return 'execute' in command && typeof command.execute === 'function';
}
