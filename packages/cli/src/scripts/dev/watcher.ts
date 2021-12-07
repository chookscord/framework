import { ChooksLogger, createLogger } from '@chookscord/logger';
import { FSWatcher, watch } from 'chokidar';
import { loaders, unloaders } from './loaders';
import { Stats } from 'fs';
import { StoreList } from './stores';
import { compileFile } from '../../lib/compile';
import { join } from 'path';
import { teardown } from './lifecycle';
import { unlink } from 'fs/promises';
import { unloadModule } from './modules';

function createRemove(
  rootOut: string,
  stores: StoreList,
  logger: ChooksLogger,
): (path: string) => Promise<void> {
  // eslint-disable-next-line complexity
  return async path => {
    logger.debug(`"${path} deleted."`);

    const moduleName = path.slice(0, path.indexOf('/'));
    const targetPath = join(rootOut, path.replace(/\.ts$/, '.js'));

    switch (moduleName) {
      case 'commands':
      case 'contexts':
        unloaders.command(targetPath, stores.commands);
        break;
      case 'subcommands':
        unloaders.subCommand(targetPath, stores.commands);
        break;
      case 'events':
        unloaders.event(targetPath, stores.events);
        break;
      default:
        await teardown(targetPath, stores.lifecycles, logger);
    }

    await unlink(targetPath);
  };
}

// Intermediary for esm and cjs ways to resolve files
const reload: (path: string) => void = process.env.MODULE_TYPE === 'module'
  ? path => unloadEventBus.emit('unload', path)
  : path => {
    for (const cacheId of unloadModule(path)) {
      unloadEventBus.emit('unload', cacheId);
    }
  };

function createUpdate(
  root: string,
  rootOut: string,
  stores: StoreList,
  logger: ChooksLogger,
): (path: string, stats?: Stats) => Promise<void> {
  // eslint-disable-next-line complexity
  return async (path, stats) => {
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
        if (await loaders.slashCommand(paths.output, stores.commands)) {
          logger.info(`Slash command "${path}" loaded.`);
        }
        break;
      case 'subcommands':
        if (await loaders.subCommand(paths.output, stores.commands)) {
          logger.info(`Slash subcommand "${path}" loaded.`);
        }
        break;
      case 'contexts':
        if (await loaders.contextCommand(paths.output, stores.commands)) {
          logger.info(`Context command "${path}" loaded.`);
        }
        break;
      case 'events':
        if (await loaders.event(paths.output, stores.events)) {
          logger.info(`Event "${path}" loaded.`);
        }
        break;
      default:
        reload(paths.output);
    }
  };
}

export function createWatcher(
  stores: StoreList,
): FSWatcher {
  const root = process.cwd();
  const rootOut = join(root, '.chooks');

  const watcher = watch('*/**/*.{js,ts}', {
    ignored: ['node_modules', 'dist', '.*'],
  });

  const logger = createLogger('[chooks] watcher');
  const update = createUpdate(root, rootOut, stores, logger);
  const remove = createRemove(rootOut, stores, logger);

  watcher.on('add', update);
  watcher.on('change', update);
  watcher.on('unlink', remove);

  return watcher;
}
