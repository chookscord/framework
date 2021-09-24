/* eslint-disable no-new */
import * as lib from '@chookscord/lib';
import * as tools from '../../../tools';
import type * as types from '@chookscord/types';
import * as utils from '../../../utils';
import type {
  CommandModule,
  Config,
  ModuleHandler,
  ModuleName,
} from '../../../types';
import type { Client } from 'discord.js';
import { WatchCompiler } from '../compiler';
import { attachInteractionListener } from './listeners';
import { createRegister } from '../register';

const logger = lib.createLogger('[cli] Chooks');

// Move this to lib
function isSubCommandOption(option: types.ChooksCommandOption): option is types.ChooksSubCommandOption {
  return option.type === 'SUB_COMMAND';
}

function isGroupOption(option: types.ChooksCommandOption): option is types.ChooksGroupCommandOption {
  return option.type === 'SUB_COMMAND_GROUP';
}

// eslint-disable-next-line complexity
function *extractCommandHandlers(
  command: types.ChooksCommand,
): Generator<[string, (ctx: types.ChooksCommandContext) => unknown]> {
  for (const option of command.options ?? []) {
    if (isSubCommandOption(option)) {
      const key = lib.createCommandKey(
        command.name,
        option.name,
      );
      yield [key, option.execute];
    } else if (isGroupOption(option)) {
      for (const subCommand of option.options) {
        if (isSubCommandOption(subCommand)) {
          const key = lib.createCommandKey(
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

export function createModuleLoader(
  client: Client,
  config: Config,
): (moduleName: ModuleName) => Promise<void> {
  let commandStore: lib.Store<types.ChooksCommand | types.ChooksInteractionCommand>;
  let moduleStore: lib.Store<CommandModule>;

  const initCommands = () => {
    commandStore = new lib.Store();
    moduleStore = new lib.Store();
    const register = createRegister(config, commandStore, { logger });

    attachInteractionListener(client, moduleStore, { logger });

    const deleteCommand = (oldCommand: types.ChooksCommand | types.ChooksInteractionCommand) => {
      for (const [key, mod] of moduleStore.entries()) {
        if (mod.data === oldCommand) {
          moduleStore.delete(key);
        }
      }
    };

    // eslint-disable-next-line complexity
    commandStore.addEventListener('set', (command, oldCommand) => {
      if (tools.didCommandChanged(command, oldCommand)) {
        register();
      }

      if (oldCommand) {
        deleteCommand(oldCommand);
      }

      const set = (key: string, execute: (ctx: never) => unknown) => {
        moduleStore.set(key, { data: command, execute });
      };

      if (lib.isSlashCommand(command) || lib.isInteraction(command)) {
        set(command.name, command.execute.bind(command));
      } else {
        for (const [key, execute] of extractCommandHandlers(command)) {
          set(key, execute);
        }
      }
    });

    commandStore.addEventListener('remove', deleteCommand);
  };

  const getCommandStore = () => {
    if (!commandStore) initCommands();
    return commandStore;
  };

  const createWatcher = (
    handler: ModuleHandler,
    moduleName: ModuleName,
  ) => {
    handler.init?.();
    new WatchCompiler({
      root: utils.appendPath.fromRoot(),
      input: moduleName,
      output: `.chooks/${moduleName}`,
      compile: handler.update?.bind(handler),
      delete: handler.remove?.bind(handler),
    });
  };

  // eslint-disable-next-line complexity
  return async moduleName => {
    switch (moduleName) {
      case 'commands': {
        const { CommandHandler } = await import('../modules/commands');
        const handler = new CommandHandler(getCommandStore() as lib.Store<types.ChooksCommand>);
        createWatcher(handler, moduleName);
      } return;
      case 'subcommands': {
        const { SubCommandHandler } = await import('../modules/sub-commands');
        const handler = new SubCommandHandler(getCommandStore() as lib.Store<types.ChooksCommand>);
        createWatcher(handler, moduleName);
      } return;
      case 'events': {
        const { EventHandler } = await import ('../modules/events');
        const handler = new EventHandler(client, config, new lib.Store());
        createWatcher(handler, moduleName);
      } return;
      case 'messages': {
        const { MessageCommandHandler } = await import('../modules/message-commands');
        const handler = new MessageCommandHandler(getCommandStore() as lib.Store<types.ChooksInteractionCommand>);
        createWatcher(handler, moduleName);
      }
    }
  };
}
