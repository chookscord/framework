/* eslint-disable complexity */
import type * as types from '@chookscord/types';
import { eachBoth, eq } from '../../utils';
import { isChoiceChanged } from './choices';

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
