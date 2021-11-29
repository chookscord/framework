/* eslint-disable @typescript-eslint/no-non-null-assertion, object-curly-newline */
import * as lib from 'chooksie/lib';
import { ChooksConfig } from 'chooksie';
import { Client } from 'discord.js';
import { EventEmitter } from 'events';
import { createLogger } from '@chookscord/logger';
import { createStoreList } from './dev/stores';
import { createWatcher } from './dev/watcher';
import { resolveConfig } from '../lib';
import { setupListeners } from './dev/listeners';

// @Choooks22: event emitter is on global to
// let the esm loader get access to the event bus
declare global {
  // eslint-disable-next-line no-var
  var unloadEventBus: EventEmitter;
}

globalThis.unloadEventBus ??= new EventEmitter();

const logger = createLogger('chooks');

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

export async function run() {
  logger.info('Starting dev server...');
  const endTimer = lib.chrono.createTimer();

  logger.debug('Getting config...');
  const config = await resolveConfig(configFiles, lib.traverse(process.cwd()));

  logger.debug('Setting up project...');
  const stores = createStoreList();
  const client = createClient(config);

  setupListeners(client, config, stores, logger);
  createWatcher(stores);

  logger.info('Logging in...');
  await client.login(config.credentials.token);

  logger.success(`${client.user!.username} connected! Time took: ${endTimer('s')}`);
}

if (process.env.MODULE_TYPE === 'module') {
  run(); // bootstrap self on esm since we can't call run from cli
}
