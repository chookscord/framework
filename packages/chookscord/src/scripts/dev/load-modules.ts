/* eslint-disable complexity */
import * as lib from '@chookscord/lib';
import type * as types from '../../types';
import * as utils from '../../utils';
import { UpdateListener, createWatchCompiler } from './compiler';
import type { ChooksCommand } from '@chookscord/types';
import type { Client } from 'discord.js';
import type { Consola } from 'consola';
import { createRegister } from './register';

export type Module = Partial<Record<'compile' | 'unlink', (filePath: string) => void | Promise<void>>>;

function createWatcher(
  moduleName: types.ModuleName,
  compile?: UpdateListener,
  unlink?: UpdateListener,
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

function loadModule<T>(
  moduleName: types.ModuleName,
  createModule: (store: T, logger?: Consola) => Module,
  store: T,
  loggerName: string | Consola,
): void {
  const logger = typeof loggerName === 'string'
    ? lib.createLogger(loggerName)
    : loggerName;
  const { compile, unlink } = createModule(store, logger);
  createWatcher(moduleName, compile, unlink, logger);
}

export function createModuleLoader(
  client: Client,
  config: types.Config,
): (moduleName: types.ModuleName) => Promise<void> {
  let commandStore: lib.Store<ChooksCommand>;

  const initCommands = async () => {
    commandStore = new lib.Store();
    const logger = lib.createLogger('[cli] Modules');
    const moduleStore = new lib.Store<types.CommandModule>();
    const register = createRegister(config, commandStore);

    // Even tho this is async, event loop is still blocked until this part is reached,
    // so race conditions with initializing store and returning undefined isn't possible
    const { attachInteractionListener, attachModuleHandler } = await import('./listeners');

    attachInteractionListener(client, moduleStore, logger);
    attachModuleHandler(register, commandStore, moduleStore);
  };

  const mods = {
    commands: {
      get store() {
        if (!commandStore) initCommands();
        return commandStore;
      },
    },
  };

  return async moduleName => {
    switch (moduleName) {
      case 'events': {
        const { createModule } = await import('./modules/events');
        const { attachEventListener } = await import('./listeners/events');
        const store = new lib.Store<types.Event>();
        const logger = lib.createLogger('[cli] Events');
        attachEventListener(store, client, config, logger);
        loadModule(moduleName, createModule, store, logger);
      } return;
      case 'commands': {
        const { createModule } = await import('./modules/commands');
        loadModule(moduleName, createModule, mods.commands.store, '[cli] Commands');
      } return;
      case 'subcommands': {
        const { createModule } = await import('./modules/subcommands');
        loadModule(moduleName, createModule, mods.commands.store, '[cli] SubCommands');
      } return;
      case 'contexts': {
        const { createModule } = await import('./modules/contexts');
        loadModule(moduleName, createModule, mods.commands.store, '[cli] Contexts');
      }
    }
  };
}
