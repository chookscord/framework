/* eslint-disable object-curly-newline */
import { ChooksCommand, ChooksContextCommand, ChooksEvent, ChooksSlashCommand, ChooksSlashSubCommand } from 'chooksie/types';
import { ChooksLogger, createLogger } from '@chookscord/logger';
import { CommandReference, extractSubCommands } from 'chooksie/lib';
import { CommandStore, EventStore } from './stores';
import { cachedImport, resolveMod } from './modules';
import { validateContextCommand, validateEvent, validateSlashCommand, validateSlashSubCommand } from '../../lib/validation';

export interface CommandModule extends CommandReference {
  logger: ChooksLogger;
}

export interface EventModule {
  event: ChooksEvent;
  logger: ChooksLogger;
}

const logger = createLogger('[chooks] loader');

async function loadSlashCommand(path: string, store: CommandStore) {
  const mod = await resolveMod<ChooksSlashCommand>(path);
  const error = validateSlashCommand(mod);

  if (error) {
    logger.error(error);
    return false;
  }

  store.set(mod.name, {
    parent: mod,
    module: mod,
    logger: createLogger(`[command] ${mod.name}`),
  });

  return true;
}

async function loadContextCommand(path: string, store: CommandStore) {
  const mod = await resolveMod<ChooksContextCommand>(path);
  const error = validateContextCommand(mod);

  if (error) {
    logger.error(error);
    return false;
  }

  store.set(mod.name, {
    parent: mod,
    module: mod,
    logger: createLogger(`[context] ${mod.name}`),
  });

  return true;
}

async function loadSubCommand(path: string, store: CommandStore) {
  const mod = await resolveMod<ChooksSlashSubCommand>(path);
  const error = validateSlashSubCommand(mod);

  if (error) {
    logger.error(error);
    return false;
  }

  for await (const [key, command] of extractSubCommands(mod)) {
    store.set(key, {
      ...command,
      logger: createLogger(`[subcommand] ${key}`),
    });
  }

  return true;
}

async function loadEvent(path: string, store: EventStore) {
  const mod = await resolveMod<ChooksEvent>(path);
  const error = validateEvent(mod);

  if (error) {
    logger.error(error);
    return false;
  }

  store.set(mod.name, {
    event: mod,
    logger: createLogger(`[event] ${mod.name}`),
  });

  return true;
}

async function unloadCommand(path: string, store: CommandStore) {
  const mod = await resolveMod<ChooksCommand>(path, cachedImport);
  store.delete(mod.name);
}

async function unloadSubCommand(path: string, store: CommandStore) {
  const mod = await resolveMod<ChooksSlashSubCommand>(path, cachedImport);
  for (const [key] of extractSubCommands(mod)) {
    store.delete(key);
  }
}

async function unloadEvent(path: string, store: EventStore) {
  const mod = await resolveMod<ChooksEvent>(path, cachedImport);
  store.delete(mod.name);
}

export const loaders = {
  slashCommand: loadSlashCommand,
  contextCommand: loadContextCommand,
  subCommand: loadSubCommand,
  event: loadEvent,
};

export const unloaders = {
  command: unloadCommand,
  subCommand: unloadSubCommand,
  event: unloadEvent,
};
