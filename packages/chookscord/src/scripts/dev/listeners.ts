import * as lib from '@chookscord/lib';
import type * as types from '../../types';
import type { Client, Interaction } from 'discord.js';
import { createTimer, resolveInteractionKey } from '../../utils';
import type { ChooksContext } from '@chookscord/types';
import type { Consola } from 'consola';

// Maybe extract
function getCtx(
  client: Client,
  commandName: string,
  interaction: Interaction,
): ChooksContext {
  return {
    fetch: lib.fetch,
    client,
    interaction,
    logger: lib.createLogger(`[commands] ${commandName}`),
  };
}

async function executeCommand(
  commandName: string,
  execute: () => unknown,
  logger?: Consola,
): Promise<void> {
  try {
    logger?.info(`Executing command "${commandName}"...`);
    const endTimer = createTimer();
    await execute();
    logger?.success(`Finished executing command "${commandName}". Time took: ${endTimer().toLocaleString()}ms`);
  } catch (error) {
    logger?.error(`Failed to execute command "${commandName}"!`);
    logger?.error(error);
  }
}

export function attachInteractionListener(
  client: Client,
  store: lib.Store<types.CommandModule>,
  logger?: Consola,
): void {
  client.on('interactionCreate', interaction => {
    const commandName = resolveInteractionKey(interaction);
    if (!commandName) return;

    const command = store.get(commandName);
    if (!command) {
      logger?.warn(`Command "${commandName}" was executed, but no handlers were registered.`);
      return;
    }

    const ctx = getCtx(client, commandName, interaction);
    const execute = command.execute.bind(command, ctx);

    executeCommand(commandName, execute);
  });
}

export function attachEventListener(
  store: lib.Store<types.Event>,
  client: Client,
  config: types.Config,
  logger?: Consola,
): void {
  function addListener(event: types.Event) {
    logger?.debug(`Adding event "${event.name}".`);
    const frequency = event.once ? 'once' : 'on';
    const ctx: types.EventContext = {
      client,
      config,
      fetch: lib.fetch,
      logger: lib.createLogger(`[events] ${event.name}`),
    };

    // Overwrite handler and bind context. Needed to remove listener later.
    // Cheap way to bind context without adding another store, might be fragile.
    event.execute = event.execute.bind(event, ctx) as never;
    client[frequency](event.name, event.execute as never);
    logger?.debug(`Event "${event.name}" added.`);
  }

  function removeListener(event: types.Event): void {
    client.removeListener(
      event.name,
      event.execute as never,
    );
    logger?.debug(`Event "${event.name}" removed.`);
  }

  store.addEventListener('set', (event, oldEvent) => {
    if (oldEvent) {
      removeListener(oldEvent);
    }
    addListener(event);
  });
}
