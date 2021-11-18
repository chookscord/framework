process.env.NODE_ENV = 'development';
import type {
  ChooksCommand,
  ChooksConfig,
  ChooksContext,
  ChooksContextCommand,
  ChooksEvent,
  ChooksEventContext,
  ChooksSlashCommand,
  ChooksSlashSubCommand,
} from 'chooksie/types';
import { ChooksTeardownList, reload } from './load-files';
import { Client, ClientEvents } from 'discord.js';
import { ConfigFile, compileFile, resolveConfig } from '../../lib';
import {
  Store,
  chrono,
  getDefaultImport,
  traverse,
  utils,
} from 'chooksie/lib';
import { basename, join } from 'path';
import { uncachedImport, unloadModule } from './unload';
import { Stats } from 'fs';
import { createLogger } from '@chookscord/logger';
import { createWatchCompiler } from './compiler';
import { fetch } from '@chookscord/fetch';
import { watch } from 'chokidar';

const logger = createLogger('[cli] Chooks');
const store: ChooksTeardownList = new Map();

// function reloadFile(client: Client, filePath: string) {
//   const fileName = basename(filePath);
//   const ctx: ChooksContext = {
//     client,
//     fetch,
//     logger: createLogger(`[file] ${fileName}`),
//   };
//   reload(ctx, store, filePath, logger);
// }

// function loadDir(client: Client, dirName: string) {
//   createWatchCompiler({
//     logger,
//     root: process.cwd(),
//     input: dirName,
//     output: `.chooks/${dirName}`,
//     compile(filePath) {
//       for (const cacheId of unloadModule(filePath)) {
//         reloadFile(client, cacheId);
//       }
//     },
//   });
// }

const configFiles = [
  ConfigFile.TSDev,
  ConfigFile.JSDev,
  ConfigFile.TS,
  ConfigFile.JS,
];

function createClient(config: ChooksConfig) {
  return new Client({
    ...config.client?.config,
    intents: config.intents,
  });
}

export async function run(): Promise<void> {
  const endTimer = chrono.createTimer();
  logger.info('Starting...');

  logger.trace('Loading config...');
  const config = await resolveConfig(
    configFiles,
    traverse(process.cwd()),
  );
  console.log(config);

  const watcher = watch('*/**/*.{ts,js}', {
    ignored: ['.*', 'node_modules'],
  });

  logger.trace('Creating client...');
  const client = createClient(config);
  const commandStore = new Store<Pick<ChooksCommand, 'setup' | 'execute'>>();
  const eventStore = new Store<ChooksEvent>();

  eventStore.on('set', (event, oldEvent) => {
    if (oldEvent) {
      logger.info(`unset old event "${oldEvent.name}"`);
      client.off(oldEvent.name, oldEvent.execute as never);
      eventStore.delete(oldEvent.name);
    }
  });

  // eslint-disable-next-line complexity
  async function onCompile(path: string, stats?: Stats) {
    if (stats?.isDirectory()) return;
    const outPath = join(process.cwd(), '.chooks', path.replace(/\.ts$/, '.js'));
    await compileFile(path, outPath);
    const moduleName = path.slice(0, path.indexOf('/'));
    console.log(moduleName);

    if (moduleName === 'events') {
      const modFile = await uncachedImport(outPath);
      const mod = getDefaultImport(modFile) as ChooksEvent;
      logger?.debug(`Adding event "${mod.name}".`);
      const frequency = mod.once ? 'once' : 'on';
      const ctx: ChooksEventContext = {
        client,
        config,
        fetch,
        logger: createLogger(`[events] ${mod.name}`),
      };

      const _execute = mod.execute;
      const execute = async (...args: ClientEvents[typeof mod.name]) => {
        const deps = await mod.setup?.call(undefined) ?? {};
        // @ts-ignore ts can't infer ...args
        _execute.call(deps, ctx, ...args);
      };

      // Overwrite handler. Needed to remove listener later.
      // Cheap way to bind context without adding another store, might be fragile.
      mod.execute = execute as never;
      client[frequency](mod.name, execute);
      logger?.debug(`Event "${mod.name}" added.`);
      eventStore.set(mod.name, mod);
    }

    if (moduleName === 'commands') {
      const modFile = await uncachedImport(outPath);
      const mod = getDefaultImport(modFile) as ChooksSlashCommand;
      commandStore.set(mod.name, { setup: mod.setup, execute: mod.execute });
    }

    if (moduleName === 'contexts') {
      const modFile = await uncachedImport(outPath);
      const mod = getDefaultImport(modFile) as ChooksContextCommand;
      commandStore.set(mod.name, { setup: mod.setup, execute: mod.execute });
    }

    if (moduleName === 'subcommands') {
      const modFile = await uncachedImport(outPath);
      const mod = getDefaultImport(modFile) as ChooksSlashSubCommand;

      for (const option of mod.options) {
        if (option.type === 'SUB_COMMAND') {
          const key = utils.createCommandKey(mod.name, option.name);
          commandStore.set(key, { setup: option.setup, execute: option.execute });
          continue;
        }

        if (option.type === 'SUB_COMMAND_GROUP') {
          for (const subCommand of option.options) {
            const key = utils.createCommandKey(mod.name, option.name, subCommand.name);
            commandStore.set(key, { setup: subCommand.setup, execute: subCommand.execute });
          }
        }
      }
    }
  }

  watcher.on('add', onCompile);
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const commandKey = utils.createCommandKey(
      interaction.commandName,
      interaction.options.getSubcommandGroup(false),
      interaction.options.getSubcommand(false),
    );

    const command = commandStore.get(commandKey);
    if (!command) {
      logger.warn('no command');
      return;
    }

    logger.info('pog');
    const deps = await command.setup?.call(undefined) ?? {};
    const _logger = createLogger(`[commands] ${commandKey}`);
    await command.execute?.call(deps, { client, fetch, interaction, logger: _logger });
  });

  // logger.trace('Loading files...');
  // const [configFile, projectFiles] = await findFiles();
  const login = client.login(config.credentials.token);

  // logger.trace('Loading modules...');
  // const loadModule = createModuleLoader(client, config);

  // for (const moduleName of projectFiles) {
  //   if (isModule(moduleName)) {
  //     logger.debug(`Module "${moduleName}" loaded.`);
  //     loadModule(moduleName);
  //   } else {
  //     logger.debug(`Local dir "${moduleName}" loaded.`);
  //     loadDir(client, moduleName);
  //   }
  // }

  logger.debug('Waiting for login...');
  await login;

  logger.success('Startup time:', endTimer());
}
