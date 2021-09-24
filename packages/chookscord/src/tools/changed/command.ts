/* eslint-disable complexity */
import type * as types from '@chookscord/types';
import { eachBoth, eq } from '../../utils';
import { didOptionChanged } from './options';

export function didCommandChanged(
  command1: Omit<types.ChooksCommand, 'execute'>,
  command2: Omit<types.ChooksCommand, 'execute'> | null,
): boolean {
  return (
    eq(command2, null) ||
    !eq(command1.name, command2.name) ||
    !eq(command1.description, command2.description) ||
    !eq(command1.type ?? 'CHAT_INPUT', command2.type ?? 'CHAT_INPUT') ||
    !eq(command1.options?.length ?? 0, command2.options?.length ?? 0) ||
    !eq(command1.defaultPermission ?? false, command2.defaultPermission ?? false) ||
    eachBoth(
      command1.options ?? [],
      command2.options ?? [],
      didOptionChanged,
    )
  );
}
