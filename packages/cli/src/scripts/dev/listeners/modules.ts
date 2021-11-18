import * as lib from '@chookscord/lib';
import type { ChooksCommand, ChooksSubCommandOption } from '@chookscord/types';
import { didCommandChanged } from '../../../tools';

// eslint-disable-next-line complexity
function *extractSubCommands(
  command: ChooksCommand,
): Generator<[string, ChooksSubCommandOption]> {
  for (const option of command.options ?? []) {
    if (lib.isSubCommandOption(option)) {
      const key = createCommandKey(
        command.name,
        option.name,
      );
      yield [key, option];
    } else if (lib.isGroupOption(option)) {
      for (const subCommand of option.options) {
        if (lib.isSubCommandOption(subCommand)) {
          const key = createCommandKey(
            command.name,
            option.name,
            subCommand.name,
          );
          yield [key, subCommand];
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
      if (mod.parent === oldCommand) {
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

    const set = (key: string, target: ChooksCommand) => {
      moduleStore.set(key, { parent: command, target });
    };

    if (typeof command.execute === 'function') {
      set(command.name, command);
    } else {
      for (const [key, subCommand] of extractSubCommands(command)) {
        set(key, subCommand as unknown as ChooksCommand);
      }
    }
  });

  commandStore.addEventListener('remove', deleteCommand);
}
