/* eslint-disable complexity */
import { ChooksChoice, ChooksCommand, ChooksOption } from 'chooksie';

// @Choooks22: These functions check if any relevant info for interactions
// have changed and will need to be reregistered. These are all so compact
// that I'm certain it'll be whack to touch these again in the future lmao

function forBoth<T>(
  a: T[],
  b: T[],
  predicate: (a: T, b: T) => boolean,
): boolean {
  // Test linearly, more efficient but it won't check if items have only changed indices, not values.
  for (let i = 0, n = a.length; i < n; i++) {
    if (predicate(a[i], b[i])) return true;
  }
  return false;
}

export function diffChoice(
  a: Partial<ChooksChoice>,
  b: Partial<ChooksChoice> | null,
): boolean {
  return b === null
  || a.name !== b.name
  || a.value !== b.value;
}

export function diffOption(
  a: Partial<ChooksOption>,
  b: Partial<ChooksOption> | null,
): boolean {
  return b === null
  || a.name !== b.name
  || a.description !== b.description
  || a.type !== b.type
  || Boolean(a.required) !== Boolean(b.required)
  || Array.isArray(a.options) && Array.isArray(b.options)
  && (a.options.length !== b.options.length
    || forBoth(a.options, b.options, diffOption)
  )
  || Array.isArray(a.choices) && Array.isArray(b.choices)
  && (a.choices.length !== b.choices.length
    || forBoth(a.choices, b.choices, diffChoice)
  );
}

export function diffCommand(
  a: Partial<ChooksCommand>,
  b: Partial<ChooksCommand> | null,
): boolean {
  return b === null
  || a.name !== b.name
  || a.description !== b.description
  || (a.type ?? 'CHAT_INPUT') !== (b.type ?? 'CHAT_INPUT')
  || Boolean(a.defaultPermission) !== Boolean(b.defaultPermission)
  || Array.isArray(a.options) && Array.isArray(b.options)
  && (a.options.length !== b.options.length
    || forBoth(a.options, b.options, diffOption)
  );
}
