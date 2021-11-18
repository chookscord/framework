import { ValidationResult, assert } from './tests';
import { ChooksEvent } from 'chooksie';

export function validateEvent(
  event: Partial<ChooksEvent>,
): ValidationResult {
  return assert(
    event.name,
    name => typeof name === 'string',
    'Invalid event name!',
  ) ??
  assert(
    event.execute,
    handler => typeof handler === 'function',
    'Invalid event handler!',
  ) ??
  assert(
    event.setup,
    fn => typeof fn === 'undefined' || typeof fn === 'function',
    'Invalid event setup!',
  );
}
