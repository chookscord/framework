import type { Client, CommandInteraction, ContextMenuInteraction } from 'discord.js';
import type { ChooksConfig } from './config';
import type { ChooksLogger } from '@chookscord/logger';
import type { FetchUtil } from '@chookscord/fetch';

export type ChooksDep = Record<string, unknown>;
export type EmptyDep = Record<string, never>;

/**
 * The base context object that all contexts will inherit from.
 */
export interface ChooksContext {
  client: Client<true>;
  logger: ChooksLogger;
  fetch: FetchUtil;
}

/**
 * The context object passed to event listeners.
 */
export interface ChooksEventContext extends ChooksContext {
  config: ChooksConfig;
}

/**
 * The context object passed to slash commands.
 */
export interface ChooksCommandContext extends ChooksContext {
  interaction: CommandInteraction;
}

/**
 * The context object passed to context menu commands.
 */
export interface ChooksContextCommandContext extends ChooksContext {
  interaction: ContextMenuInteraction;
}
