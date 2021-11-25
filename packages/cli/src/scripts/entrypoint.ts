import 'dotenv/config';
import * as lib from 'chooksie/lib';
import { Awaitable, Client, Interaction } from 'discord.js';
import { ChooksLogger, createLogger } from '@chookscord/logger';
import { basename } from 'path';
import config from './chooks.config.js';
import { fetch } from '@chookscord/fetch';
import type types from 'chooksie/types';

type ModuleStore = lib.Store<CommandModule>;
type FileLifecycle = {
  chooksOnLoad: types.ChooksLifecycle;
};

interface CommandModule {
  logger: ChooksLogger;
  execute: (ctx: types.ChooksCommandContext) => Awaitable<void>;
}

const logger = createLogger('bot');
const console = logger;

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
  return async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      const commandKey = lib.utils.createCommandKey(
        interaction.commandName,
        interaction.options.getSubcommandGroup(false),
        interaction.options.getSubcommand(false),
      );

      const command = store.get(commandKey);
      if (!command) return;

      // @todo(Choooks22): try/catch and logging with timer
      await command.execute({
        client,
        fetch,
        interaction,
        logger: command.logger,
      });
    }
  };
}

function resolveModule(filePath: string) {
  const relativePath = filePath.slice(__dirname.length + 1);
  return relativePath.includes('/')
    ? relativePath.slice(0, relativePath.indexOf('/'))
    : relativePath;
}

async function loadEvent(mod: types.ChooksEvent): Promise<void> {
  const deps = await mod.setup?.call(undefined);
  const frequency = mod.once ? 'once' : 'on';
  let ctx = createCtx(`[event] ${mod.name}`) as types.ChooksEventContext;
  ctx = { ...ctx, config };

  client[frequency](mod.name, mod.execute.bind(deps, ctx) as never);
  console.log(`loaded event "${mod.name}"`);
}

async function loadCommand(
  mod: types.ChooksSlashCommand,
  store: ModuleStore,
): Promise<void> {
  const deps = await mod.setup?.call(undefined) ?? {};
  store.set(mod.name, {
    execute: mod.execute.bind(deps),
    logger: createLogger(`[command] ${mod.name}`),
  });
  console.log(`loaded command "${mod.name}"`);
}

// eslint-disable-next-line complexity
async function *extractSubCommands(
  mod: types.ChooksSlashSubCommand,
  group?: types.ChooksCommandGroupOption,
): AsyncGenerator<CommandModule & { key: string }> {
  const yieldSubCommand = async (
    option: types.ChooksSubCommandOption,
  ): Promise<CommandModule & { key: string }> => {
    const deps = await option.setup?.call(undefined) ?? {};
    const key = lib.utils.createCommandKey(
      mod.name,
      group?.name,
      option.name,
    );
    console.log(`load ${key}`);
    return {
      key,
      execute: option.execute.bind(deps),
      logger: createLogger(`[command] ${key}`),
    };
  };

  const options = group?.options ?? mod.options;
  for (const option of options) {
    switch (option.type) {
      case 'SUB_COMMAND_GROUP':
        yield* extractSubCommands(mod, option);
        break;
      case 'SUB_COMMAND':
        yield yieldSubCommand(option);
    }
  }
}

async function loadSubCommand(
  mod: types.ChooksSlashSubCommand,
  store: ModuleStore,
): Promise<void> {
  for await (const subCommand of extractSubCommands(mod)) {
    const { key, ...subCommandModule } = subCommand;
    store.set(key, subCommandModule);
  }
}

async function loadContextCommand(
  mod: types.ChooksContextCommand,
  store: ModuleStore,
): Promise<void> {
  const deps = await mod.setup?.call(undefined) ?? {};
  store.set(mod.name, {
    execute: mod.execute.bind(deps),
    logger: createLogger(`[command] ${mod.name}`),
  });
  console.log(`loaded context command "${mod.name}"`);
}

const loaders = {
  events: loadEvent,
  commands: loadCommand,
  subcommands: loadSubCommand,
  contexts: loadContextCommand,
};

async function startBot(store: ModuleStore): Promise<void> {
  const listener = createListener(store);
  client.on('interactionCreate', listener);
  logger.info('Starting bot...');
  await client.login(config.credentials.token);
  logger.success('Bot started!');
}

async function loadFile(file: lib.File, store: ModuleStore): Promise<void> {
  const moduleName = resolveModule(file.path);

  if (moduleName.includes('.')) return;
  const mod: Record<string, unknown> = lib.getDefaultImport(await import(file.path));
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
  const store = new lib.Store<CommandModule>();
  startBot(store);

  for await (const file of lib.traverse(__dirname, { recursive: true })) {
    if (file.isDir) continue;
    loadFile(file, store);
  }
}

main();
