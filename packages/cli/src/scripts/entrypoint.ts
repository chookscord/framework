// For some reason "mod.name" is typed as "any" according to eslint
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'dotenv/config';
import { Awaitable, Client, Interaction } from 'discord.js';
import { ChooksLogger, createLogger } from '@chookscord/logger';
import { File, Store } from 'chooksie/lib';
import { basename } from 'path';
import { chooksie } from '../lib';
import config from './chooks.config.js';
import { fetch } from '@chookscord/fetch';
import type types from 'chooksie/types';

type ModuleStore = Store<CommandModule>;
type FileLifecycle = {
  chooksOnLoad: types.ChooksLifecycle;
};

interface CommandModule {
  logger: ChooksLogger;
  execute: (ctx: types.ChooksCommandContext) => Awaitable<void>;
}

const logger = createLogger('chooks');

const client = new Client({
  ...config.client?.config,
  intents: config.intents,
});

function createCtx(loggerName: string): types.ChooksContext {
  return {
    client,
    fetch,
    logger: createLogger(loggerName),
  };
}

function hasLifecycle(mod: Record<string, unknown>): mod is FileLifecycle {
  return 'chooksOnLoad' in mod && typeof mod.chooksOnLoad === 'function';
}

function createListener(store: ModuleStore) {
  return (interaction: Interaction) => {
    const commandKey = chooksie.utils.resolveCommandKey(interaction);
    if (!commandKey) return;

    const command = store.get(commandKey);
    if (!command) {
      logger.warn(`Command "${commandKey}" was run, but not handler was present!`);
      return;
    }

    chooksie.executeCommand(commandKey, async () => {
      const ctx = { client, fetch, interaction, logger: command.logger };
      await command.execute(ctx as types.ChooksCommandContext);
    }, command.logger);
  };
}

function resolveModule(filePath: string) {
  const relativePath = filePath.slice(__dirname.length + 1);
  return relativePath.includes('/')
    ? relativePath.slice(0, relativePath.indexOf('/'))
    : relativePath;
}

async function loadEvent(mod: types.ChooksEvent): Promise<void> {
  const deps = await mod.setup?.call(undefined) ?? {};
  const frequency = mod.once ? 'once' : 'on';
  let ctx = createCtx(`[event] ${mod.name}`) as types.ChooksEventContext;
  ctx = { ...ctx, config };

  client[frequency](mod.name, mod.execute.bind(deps, ctx) as never);
  logger.success(`Loaded event "${mod.name}".`);
}

async function loadCommand(
  mod: types.ChooksCommand<Record<string, unknown>> | types.ChooksSubCommandOption<Record<string, unknown>>,
  store: ModuleStore,
  loggerName: string,
  modName = mod.name,
): Promise<void> {
  const deps = await mod.setup?.call(undefined) ?? {};
  store.set(modName, {
    execute: mod.execute?.bind(deps) ?? (ctx => ctx.interaction.reply('Not implemented!')),
    logger: createLogger(loggerName),
  });
}

async function loadSlashCommand(
  mod: types.ChooksSlashCommand<Record<string, unknown>>,
  store: ModuleStore,
): Promise<void> {
  await loadCommand(mod, store, `[command] ${mod.name}`);
  logger.success(`Loaded slash command "${mod.name}".`);
}

async function loadContextCommand(
  mod: types.ChooksContextCommand,
  store: ModuleStore,
): Promise<void> {
  await loadCommand(mod, store, `[context] ${mod.name}`);
  logger.success(`loaded context command "${mod.name}".`);
}

function loadSubCommand(
  mod: types.ChooksSlashSubCommand,
  store: ModuleStore,
): void {
  for (const [key, subCommand] of chooksie.extractSubCommands(mod)) {
    (async () => {
      await loadCommand(subCommand.module, store, `[command] ${key}`, key);
      logger.success(`Loaded subcommand "${key}".`);
    })();
  }
}

const loaders = {
  events: loadEvent,
  commands: loadSlashCommand,
  subcommands: loadSubCommand,
  contexts: loadContextCommand,
};

async function startBot(store: ModuleStore): Promise<void> {
  const endTimer = chooksie.chrono.createTimer();
  const listener = createListener(store);
  client.on('interactionCreate', listener);
  logger.info('Starting bot...');
  await client.login(config.credentials.token);
  logger.success(`Bot started! Time took: ${endTimer('s')}`);
}

async function loadFile(file: File, store: ModuleStore): Promise<void> {
  const moduleName = resolveModule(file.path);

  if (moduleName.includes('.')) return;
  const mod: Record<string, unknown> = chooksie.getDefaultImport(await import(file.path));
  const loader = loaders[moduleName as keyof typeof loaders];

  if (loader) {
    loader(mod as never, store);
    return;
  }

  if (hasLifecycle(mod)) {
    const fileName = basename(file.path, '.js');
    mod.chooksOnLoad(createCtx(`[file] ${fileName}`));
  }
}

async function main(): Promise<void> {
  const store = new chooksie.Store<CommandModule>();
  startBot(store);

  for await (const file of chooksie.traverse(__dirname, { recursive: true })) {
    if (file.isDir) continue;
    loadFile(file, store);
  }
}

main();
