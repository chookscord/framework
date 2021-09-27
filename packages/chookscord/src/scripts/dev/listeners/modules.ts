import * as lib from '@chookscord/lib';
import type { ChooksCommand, ChooksCommandContext } from '@chookscord/types';
import type { CommandModule } from '../../../types';
import { createCommandKey } from '../../../utils';
import { didCommandChanged } from '../../../tools';

// eslint-disable-next-line complexity
function *extractCommandHandlers(
  command: ChooksCommand,
): Generator<[string, (ctx: ChooksCommandContext) => unknown]> {
  for (const option of command.options ?? []) {
    if (lib.isSubCommandOption(option)) {
      const key = createCommandKey(
        command.name,
        option.name,
      );
      yield [key, option.execute];
    } else if (lib.isGroupOption(option)) {
      for (const subCommand of option.options) {
        if (lib.isSubCommandOption(subCommand)) {
          const key = createCommandKey(
            command.name,
            option.name,
            subCommand.name,
          );
          yield [key, subCommand.execute];
        }
      }
    }
  }
}

export function attachModuleHandler(
  register: () => void,
  commandStore: lib.Store<ChooksCommand>,
  moduleStore: lib.Store<CommandModule>,
): void {
  const deleteCommand = (oldCommand: ChooksCommand) => {
    for (const [key, mod] of moduleStore.entries()) {
      if (mod.data === oldCommand) {
        moduleStore.delete(key);
      }
    }
  };

  // eslint-disable-next-line complexity
  commandStore.addEventListener('set', (command, oldCommand) => {
    if (didCommandChanged(command, oldCommand)) {
      register();
    }

    if (oldCommand) {
      deleteCommand(oldCommand);
    }

    const set = (key: string, execute: (ctx: never) => unknown) => {
      moduleStore.set(key, { data: command, execute });
    };

    if (typeof command.execute === 'function') {
      set(command.name, command.execute.bind(command));
    } else {
      for (const [key, execute] of extractCommandHandlers(command)) {
        set(key, execute);
      }
    }
  });

  commandStore.addEventListener('remove', deleteCommand);
}
