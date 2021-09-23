export function createCommandKey(
  commandName: string,
  subCommandName?: string | null,
): string;
export function createCommandKey(
  commandName: string,
  groupName: string | null,
  subCommandName?: string | null,
): string;
export function createCommandKey(
  commandName: string,
  groupName: string | null = null,
  subCommandName: string | null = null,
): string {
  return [commandName, groupName, subCommandName]
    .filter(Boolean)
    .join(' ');
}
