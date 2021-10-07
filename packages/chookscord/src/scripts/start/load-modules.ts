import * as lib from '@chookscord/lib';
import type * as types from '@chookscord/types';
import * as utils from '../../utils';
import type { ModuleContext, ModuleName } from '../../types';
import { executeCommand, getCommandCtx } from '../../tools';
import { Client } from 'discord.js';

export type CommandHandler = (
  ctx: types.ChooksCommandContext | types.ChooksContextCommandContext
) => unknown;

const logger = lib.createLogger('[cli] Modules');

function attachListener(
  client: Client,
  store: lib.Store<CommandHandler>,
) {
  client.on('interactionCreate', interaction => {
    const commandName = utils.resolveInteractionKey(interaction);
    if (!commandName) return;

    const execute = store.get(commandName);
    if (execute) {
      const ctx = getCommandCtx(client, commandName, interaction);
      executeCommand(commandName, () => execute(ctx), logger);
    } else {
      logger.warn(`Command "${commandName}" was executed, but not handler was found!`);
    }
  });
}

export function createModuleLoader(
  ctx: ModuleContext,
): (moduleName: ModuleName) => Promise<void> {
  let commandStore: lib.Store<CommandHandler>;
  const initCommands = () => {
    commandStore = new lib.Store({ name: '[cli] Commands' });
    attachListener(ctx.client, commandStore);
  };

  const getCommandStore = () => {
    if (!commandStore) initCommands();
    return commandStore;
  };

  // eslint-disable-next-line complexity
  return async moduleName => {
    const modulePath = utils.appendPath.fromOut(moduleName);
    switch (moduleName) {
      case 'events': {
        const { loadEvents } = await import('./modules/events');
        await loadEvents(ctx, modulePath);
      } return;
      // @Choooks22: Maybe these parts can be simplified
      case 'commands': {
        const store = getCommandStore();
        const { getCommands } = await import('./modules/commands');
        for await (const [key, command] of getCommands(modulePath)) {
          store.set(key, command.execute);
        }
      } return;
      case 'subcommands': {
        const store = getCommandStore();
        const { getSubCommands } = await import('./modules/subcommands');
        for await (const [key, command] of getSubCommands(modulePath)) {
          store.set(key, command.execute);
        }
      } return;
      case 'contexts': {
        const store = getCommandStore();
        const { getContextCommands } = await import('./modules/context-commands');
        for await (const [key, command] of getContextCommands(modulePath)) {
          store.set(key, command.execute as CommandHandler);
        }
      }
    }
  };
}

function hasLifecycle(
  mod: Record<string, unknown>,
): mod is { chooksOnLoad: () => unknown } {
  return 'chooksOnLoad' in mod &&
    typeof mod.chooksOnLoad === 'function';
}

export async function loadFiles(dir: string): Promise<void> {
  const path = utils.appendPath.fromOut(dir);
  for await (const file of lib.loadDir(path, { recursive: true })) {
    if (file.isDirectory) continue;
    const mod: Record<string, unknown> = await import(file.path);
    if (hasLifecycle(mod)) mod.chooksOnLoad();
  }
}
