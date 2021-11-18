export function createCommandKey(
  ...names: [string, (string | null)?, (string | null)?]
): string {
  return names
    .filter(name => typeof name === 'string')
    .join('.');
}
