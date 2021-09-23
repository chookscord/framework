import * as validate from '@chookscord/validate';
import { Event } from '../types';

export function validateEvent(event: Event): validate.ValidationError {
  return validate.assert(
    event.name?.length,
    Boolean,
    'Missing event name!',
  ) ??
  validate.assert(
    event.execute,
    validate.isType('function'),
    'Missing event handler!',
  );
}
