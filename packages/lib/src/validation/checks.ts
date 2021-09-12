import type * as types from '@chookscord/types';

export function optionIsType(
  types: types.ChooksCommandOptionType[]
): (option: types.ChooksCommandOption) => boolean;
export function optionIsType(
  types: types.ChooksCommandOptionType[],
  option: types.ChooksCommandOption
): boolean;
export function optionIsType(
  types: types.ChooksCommandOptionType[],
  option?: types.ChooksCommandOption,
): boolean | ((option: types.ChooksCommandOption) => boolean) {
  return option
    ? types.includes(option.type)
    : x => optionIsType(types, x);
}
