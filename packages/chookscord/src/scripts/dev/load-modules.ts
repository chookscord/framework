import * as lib from '@chookscord/lib';
import * as tools from '../../tools';
import type * as types from '@chookscord/types';
import * as utils from '../../utils';
import type {
  CommandModule,
  Config,
  Event,
  ModuleName,
} from '../../types';
import { UpdateListener, createWatchCompiler } from './compiler';
import { attachEventListener, attachInteractionListener } from './listeners';
import type { Client } from 'discord.js';
import type { Consola } from 'consola';
import { createRegister } from './register';

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
      const key = utils.createCommandKey(
        command.name,
        option.name,
      );
      yield [key, option.execute];
    } else if (isGroupOption(option)) {
      for (const subCommand of option.options) {
        if (isSubCommandOption(subCommand)) {
          const key = utils.createCommandKey(
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

function createWatcher(
  moduleName: ModuleName,
  compile: UpdateListener,
  unlink: UpdateListener,
  logger?: Consola,
): void {
  createWatchCompiler({
    root: utils.appendPath.fromRoot(),
    input: moduleName,
    output: `.chooks/${moduleName}`,
    compile,
    unlink,
    logger,
  });
}

export function createModuleLoader(
  client: Client,
  config: Config,
): (moduleName: ModuleName) => Promise<void> {
  let commandStore: lib.Store<types.ChooksCommand>;
  let moduleStore: lib.Store<CommandModule>;

  const initCommands = () => {
    const logger = lib.createLogger('[cli] Modules');
    commandStore = new lib.Store();
    moduleStore = new lib.Store();
    const register = createRegister(config, commandStore);

    attachInteractionListener(client, moduleStore, logger);

    const deleteCommand = (oldCommand: types.ChooksCommand) => {
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

      if (typeof command.execute === 'function') {
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

  // eslint-disable-next-line complexity
  return async moduleName => {
    switch (moduleName) {
      case 'commands': {
        const { update, unlink } = await import('./modules/commands');
        const paths = {};
        const store = getCommandStore();
        const logger = lib.createLogger('[cli] Commands');
        createWatcher(
          moduleName,
          filePath => update(paths, store, filePath, logger),
          filePath => { unlink(paths, store, filePath, logger) },
          logger,
        );
      } return;
      case 'subcommands': {
        const { update, unlink } = await import('./modules/subcommands');
        const paths = {};
        const store = getCommandStore();
        const logger = lib.createLogger('[cli] SubCommands');
        createWatcher(
          moduleName,
          filePath => update(paths, store, filePath, logger),
          filePath => { unlink(paths, store, filePath, logger) },
          logger,
        );
      } return;
      case 'events': {
        const { update, unlink } = await import ('./modules/events');
        const paths = {};
        const store = new lib.Store<Event>();
        const logger = lib.createLogger('[cli] Events');
        attachEventListener(store, client, config, logger);
        createWatcher(
          moduleName,
          filePath => update(paths, store, filePath, logger),
          filePath => { unlink(paths, store, filePath, logger) },
          logger,
        );
      } return;
      case 'contexts': {
        const { update, unlink } = await import('./modules/contexts');
        const paths = {};
        const store = getCommandStore();
        const logger = lib.createLogger('[cli] Contexts');
        createWatcher(
          moduleName,
          filePath => update(paths, store, filePath, logger),
          filePath => { unlink(paths, store, filePath, logger) },
          logger,
        );
      }
    }
  };
}
