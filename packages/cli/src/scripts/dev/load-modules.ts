/* eslint-disable complexity */
import type * as types from 'chooksie/types';
import { ChooksLogger, createLogger } from '@chookscord/logger';
import { UpdateListener, createWatchCompiler } from './compiler';
import type { ChooksCommand } from 'chooksie/types';
import type { Client } from 'discord.js';
import { Store } from 'chooksie/lib';
import { createRegister } from './register';

export type Module = Partial<Record<'compile' | 'unlink', (filePath: string) => void | Promise<void>>>;

function createWatcher(
  moduleName: types.ModuleName,
  compile?: UpdateListener,
  unlink?: UpdateListener,
  logger?: ChooksLogger,
): void {
  createWatchCompiler({
    root: process.cwd(),
    input: moduleName,
    output: `.chooks/${moduleName}`,
    compile,
    unlink,
    logger,
  });
}

function loadModule<T>(
  moduleName: types.ModuleName,
  createModule: (store: T, logger?: ChooksLogger) => Module,
  store: T,
  loggerName: string | ChooksLogger,
): void {
  const logger = typeof loggerName === 'string'
    ? createLogger(loggerName)
    : loggerName;
  const { compile, unlink } = createModule(store, logger);
  createWatcher(moduleName, compile, unlink, logger);
}

export function createModuleLoader(
  client: Client,
  config: types.ChooksConfig,
): (moduleName: types.ModuleName) => Promise<void> {
  let commandStore: Store<ChooksCommand>;

  const initCommands = async () => {
    commandStore = new Store();
    const logger = createLogger('[cli] Modules');
    const moduleStore = new Store<types.CommandModule>();
    const register = createRegister(config, commandStore);

    // Even tho this is async, event loop is still blocked until this part is reached,
    // so race conditions with initializing store and returning undefined isn't possible
    const { attachInteractionListener, attachModuleHandler } = await import('./listeners');

    attachInteractionListener(client, moduleStore, logger);
    attachModuleHandler(register, commandStore, moduleStore);
  };

  const getStore = () => {
    if (!commandStore) initCommands();
    return commandStore;
  };

  return async moduleName => {
    switch (moduleName) {
      case 'events': {
        const { createModule } = await import('./modules/events');
        const { attachEventListener } = await import('./listeners/events');
        const store = new Store<types.ChooksEvent>();
        const logger = createLogger('[cli] Events');
        attachEventListener(store, client, config, logger);
        loadModule(moduleName, createModule, store, logger);
      } return;
      case 'commands': {
        const { createModule } = await import('./modules/commands');
        loadModule(moduleName, createModule, getStore(), '[cli] Commands');
      } return;
      case 'subcommands': {
        const { createModule } = await import('./modules/subcommands');
        loadModule(moduleName, createModule, getStore(), '[cli] SubCommands');
      } return;
      case 'contexts': {
        const { createModule } = await import('./modules/contexts');
        loadModule(moduleName, createModule, getStore(), '[cli] Contexts');
      }
    }
  };
}
