/* eslint-disable complexity */
import type * as types from '@chookscord/types';

function eq<A, B extends A>(a: A, b: B): a is B {
  return a === b;
}

function eachBoth<T>(
  a: T[],
  b: T[],
  check: (a: T, b: T) => boolean,
): boolean {
  for (let i = 0, n = a.length; i < n; i++) {
    if (check(a[i], b[i])) return true;
  }
  return false;
}

export function isChoiceChanged(
  choice1: types.ChooksCommandOptionChoice,
  choice2: types.ChooksCommandOptionChoice,
): boolean {
  return (
    !eq(choice1.name, choice2.name) ||
    !eq(choice1.value, choice2.value)
  );
}

export function isOptionChanged(
  option1: types.ChooksCommandOption,
  option2: types.ChooksCommandOption,
): boolean {
  return (
    !eq(option1.name, option2.name) ||
    !eq(option1.description, option2.description) ||
    !eq(option1.type, option2.type) ||
    !eq(Boolean(option1.required), Boolean(option2.required)) ||
    !eq(option1.options?.length ?? 0, option2.options?.length ?? 0) ||
    !eq(option1.choices?.length ?? 0, option2.choices?.length ?? 0) ||
    eachBoth(
      option1.choices ?? [],
      option2.choices ?? [],
      isChoiceChanged,
    ) ||
    eachBoth(
      option1.options ?? [],
      option2.options ?? [],
      isOptionChanged,
    )
  );
}
