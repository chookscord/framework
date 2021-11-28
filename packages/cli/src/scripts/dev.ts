/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as lib from 'chooksie/lib';
import {
  ChooksCommandContext,
  ChooksConfig,
  ChooksContextCommand,
  ChooksEvent,
  ChooksLifecycle,
  ChooksSlashCommand,
  ChooksSlashSubCommand,
  ChooksTeardown,
} from 'chooksie';
import { ChooksLogger, createLogger } from '@chookscord/logger';
import { Client, ClientEvents, Interaction } from 'discord.js';
import { cachedImport, uncachedImport, unloadModule } from './dev/unload';
import { EventEmitter } from 'events';
import { Stats } from 'fs';
import { compileFile } from '../lib/compile';
import { fetch } from '@chookscord/fetch';
import { join } from 'path';
import { resolveConfig } from '../lib/config';
import { unlink } from 'fs/promises';
import { watch } from 'chokidar';

// @Choooks22: event emitter is on global to
// let the esm loader get access to the event bus
declare global {
  // eslint-disable-next-line no-var
  var unloadEventBus: EventEmitter;
}

globalThis.unloadEventBus ??= new EventEmitter();

const root = process.cwd();
const rootOut = join(root, '.chooks');
const logger = createLogger('chooks');

interface CommandModule extends lib.CommandReference {
  logger: ChooksLogger;
}

interface EventModule {
  event: ChooksEvent;
  logger: ChooksLogger;
}

type CommandStore = lib.Store<CommandModule>;
type EventStore = lib.Store<EventModule>;
type LifecycleStore = lib.Store<ChooksTeardown>;

const configFiles = [
  lib.ConfigFile.JS,
  lib.ConfigFile.TS,
  lib.ConfigFile.JSDev,
  lib.ConfigFile.TSDev,
];

function createClient(config: ChooksConfig) {
  return new Client({
    ...config.client?.config,
    intents: config.intents,
  });
}

function createListener(store: lib.Store<CommandModule>): (interaction: Interaction) => void {
  return interaction => {
    const commandKey = lib.utils.resolveCommandKey(interaction);
    if (!commandKey) return;

    const command = store.get(commandKey);
    if (!command) {
      logger.warn(`Command "${commandKey}" was run, but no handler was found!`);
      return;
    }

    // ctx is casted since interaction is validated but was not narrowed.
    lib.executeCommand(commandKey, async () => {
      const deps = await command.module.setup?.call(undefined) ?? {};
      const ctx = { client: interaction.client, fetch, interaction, logger: command.logger };
      await command.module.execute!.call(deps, ctx as ChooksCommandContext);
    });
  };
}

async function resolveMod<T>(path: string): Promise<T> {
  const file = await uncachedImport<T>(path);
  return lib.getDefaultImport(file);
}

async function loadSlashCommand(path: string, store: CommandStore) {
  const mod = await resolveMod<ChooksSlashCommand>(path);
  store.set(mod.name, {
    parent: mod,
    module: mod,
    logger: createLogger(`[command] ${mod.name}`),
  });
}

async function loadContextCommand(path: string, store: CommandStore) {
  const mod = await resolveMod<ChooksContextCommand>(path);
  store.set(mod.name, {
    parent: mod,
    module: mod,
    logger: createLogger(`[context] ${mod.name}`),
  });
}

async function loadSubCommand(path: string, store: CommandStore) {
  const mod = await resolveMod<ChooksSlashSubCommand>(path);
  for await (const [key, subCommand] of lib.extractSubCommands(mod)) {
    store.set(key, {
      ...subCommand,
      logger: createLogger(`[subcommand] ${key}`),
    });
  }
}

async function loadEvent(path: string, store: EventStore) {
  const mod = await resolveMod<ChooksEvent>(path);
  store.set(mod.name, {
    event: mod,
    logger: createLogger(`[event] ${mod.name}`),
  });
}

// eslint-disable-next-line complexity
async function loadFile(client: Client, path: string, store: LifecycleStore) {
  const fileName = path.slice(rootOut.length + 1);
  let mod = await cachedImport<{ chooksOnLoad: ChooksLifecycle }>(path);
  mod = lib.getDefaultImport(mod);

  const teardown = store.get(path);
  if (teardown) {
    await teardown();
    logger.debug(`Tore down "${path}".`);
  }

  if ('chooksOnLoad' in mod && typeof mod.chooksOnLoad === 'function') {
    const cleanup = await mod.chooksOnLoad({ client, fetch, logger: createLogger(`[file] ${fileName}`) });
    if (cleanup) {
      store.set(path, cleanup);
      logger.debug('Saved cleanup function.');
    }
  }
}

// Intermediary for esm and cjs ways to resolve files
const unload: (path: string) => void = process.env.MODULE_TYPE === 'module'
  ? path => unloadEventBus.emit('unload', path)
  : path => {
    for (const cacheId of unloadModule(path)) {
      unloadEventBus.emit('unload', cacheId);
    }
  };

export async function run() {
  logger.info('Starting dev server...');
  logger.debug('Getting config...');
  const config = await resolveConfig(configFiles, lib.traverse(process.cwd()));

  logger.debug('Creating client...');
  const client = createClient(config);

  const commandStore: CommandStore = new lib.Store();
  const eventStore: EventStore = new lib.Store();
  const lifecycleStore: LifecycleStore = new lib.Store();

  const listener = createListener(commandStore);
  client.on('interactionCreate', listener);

  eventStore.on('set', (mod, oldMod) => {
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
  });

  const watcher = watch('*/**/*.{js,ts}', {
    ignored: ['node_modules', 'dist', '.*'],
  });

  // eslint-disable-next-line complexity
  const onUpdate = async (path: string, stats?: Stats) => {
    if (!stats?.isFile()) return;

    logger.debug(`"${path}" updated.`);
    const moduleName = path.slice(0, path.indexOf('/'));
    const paths = {
      input: join(root, path),
      output: join(rootOut, path.replace(/\.ts$/, '.js')),
    };

    logger.trace(`Compiling "${path}"...`);
    await compileFile(paths.input, paths.output);
    logger.trace('Compiled.');

    switch (moduleName) {
      case 'commands':
        await loadSlashCommand(paths.output, commandStore);
        logger.info(`Slash command "${path}" loaded.`);
        break;
      case 'subcommands':
        await loadSubCommand(paths.output, commandStore);
        logger.info(`Slash subcommand "${path}" loaded.`);
        break;
      case 'contexts':
        await loadContextCommand(paths.output, commandStore);
        logger.info(`Context command "${path}" loaded.`);
        break;
      case 'events':
        await loadEvent(paths.output, eventStore);
        logger.info(`Event "${path}" loaded.`);
        break;
      default:
        unload(paths.output);
    }
  };

  const onDelete = async (path: string) => {
    logger.debug(`"${path} deleted."`);
    const targetPath = join(rootOut, path.replace(/\.ts$/, '.js'));
    await unlink(targetPath);
  };

  watcher.on('add', onUpdate);
  watcher.on('change', onUpdate);

  watcher.on('unlink', onDelete);

  // @Choooks22: this algorithm is run twice on esm
  const loaded = new Set<string>();
  unloadEventBus.on('unload', (path: string) => {
    if (loaded.has(path)) return;
    loaded.add(path);
    loadFile(client, path, lifecycleStore);
    Promise.resolve().then(() => loaded.delete(path));
  });
}

if (process.env.MODULE_TYPE === 'module') {
  run(); // bootstrap self on esm since we can't call run from cli
}
