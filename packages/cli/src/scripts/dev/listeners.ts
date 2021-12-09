/* eslint-disable @typescript-eslint/no-non-null-assertion, object-curly-newline */
import * as lib from '../../lib';
import { Awaitable, Client, ClientEvents, Interaction } from 'discord.js';
import { ChooksCommand, ChooksCommandContext, ChooksConfig, ChooksContext } from 'chooksie/types';
import { ChooksLogger, createLogger } from '@chookscord/logger';
import { CommandModule, EventModule } from './loaders';
import { CommandStore, LifecycleStore, StoreList } from './stores';
import { fetch } from '@chookscord/fetch';
import { join } from 'path';
import { setup } from './lifecycle';

// The loader attached to Client#on('interactionCreate')
export function createInteractionHandler(
  store: CommandStore,
  logger: ChooksLogger,
): (interaction: Interaction) => void {
  return interaction => {
    const commandKey = lib.chooksie.utils.resolveCommandKey(interaction);
    if (!commandKey) return;

    const command = store.get(commandKey);
    if (!command) {
      logger.warn(`Command "${commandKey}" was run, but no handler was found!`);
      return;
    }

    // ctx is casted since interaction is validated but was not narrowed.
    lib.chooksie.executeCommand(commandKey, async () => {
      const deps = await command.module.setup?.call(undefined) ?? {};
      const ctx = { client: interaction.client, fetch, interaction, logger: command.logger };
      await command.module.execute!.call(deps, ctx as unknown as ChooksCommandContext);
    }, command.logger);
  };
}

// The loader attached to CommandStore#on('set')
export function createCommandSetListener(
  register: lib.InteractionRegister,
  getCommands: () => Iterable<CommandModule>,
): (mod: CommandModule, oldMod: CommandModule | null) => Promise<import('chooksie/lib').utils.Debounced<void>> {
  let _register = register;
  return lib.chooksie.utils.debounceAsync(async (mod, oldMod) => {
    if (oldMod && !lib.diffCommand(mod.parent, oldMod.parent)) {
      return;
    }

    const filtered = new Set<ChooksCommand>();
    for (const command of getCommands()) {
      filtered.add(command.parent);
    }

    const res = lib.transformCommandList(filtered);
    // eslint-disable-next-line require-atomic-updates
    _register = await _register(res);
  }, 100);
}

// The loader attached to EventStore#on('set')
export function createEventSetListener(
  client: Client,
  config: ChooksConfig,
): (mod: EventModule, oldMod: EventModule | null) => Awaitable<void> {
  return (mod, oldMod) => {
    if (oldMod) {
      client.off(oldMod.event.name, oldMod.event.execute as never);
    }

    // Overwrite event since we need the same reference when removing above
    const _execute = mod.event.execute;
    const execute = async (...args: ClientEvents[keyof ClientEvents]) => {
      const deps = await mod.event.setup?.call(undefined) ?? {};
      // @ts-ignore ts can't infer ...args
      await _execute.call(deps, { client, config, fetch, logger: mod.logger }, ...args);
    };

    mod.event.execute = execute as never;
    const freq = mod.event.once ? 'once' : 'on';
    client[freq](mod.event.name, execute);
  };
}

// The loader attached to the global event bus
// Acts as an intermediary to allow both esm and cjs to resolve files
export function createUnloadListener(
  rootOut: string,
  client: Client,
  store: LifecycleStore,
  logger: ChooksLogger,
): (path: string) => void {
  const unload = (path: string) => {
    const relativePath = path.slice(rootOut.length + 1);
    const ctx: ChooksContext = {
      client,
      fetch,
      logger: createLogger(`[file] ${relativePath}`),
    };
    setup(path, store, ctx, logger);
  };

  if (process.env.MODULE_TYPE === 'module') {
    const loaded = new Set<string>();
    return path => {
      if (!loaded.has(path)) {
        loaded.add(path);
        unload(path);
        Promise.resolve().then(() => loaded.delete(path));
      }
    };
  }

  return unload;
}

export function setupListeners(
  client: Client,
  config: ChooksConfig,
  stores: StoreList,
  logger: ChooksLogger,
): void {
  // Attach interaction handler
  const interactionHandler = createInteractionHandler(stores.commands, logger);
  client.on('interactionCreate', interactionHandler);

  // Attach interaction auto register
  const register = lib.createRegister({ guildId: config.devServer, ...config.credentials });
  const commandSetter = createCommandSetListener(register, () => stores.commands.getAll());
  stores.commands.on('set', commandSetter);

  // Attach event handlers
  const eventSetter = createEventSetListener(client, config);
  stores.events.on('set', eventSetter);

  // Attach listener to global unload event bus
  const rootOut = join(process.cwd(), '.chooks');
  const unload = createUnloadListener(rootOut, client, stores.lifecycles, logger);
  unloadEventBus.on('unload', unload);
}
