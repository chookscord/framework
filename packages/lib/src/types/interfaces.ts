import type {
  Awaited,
  Client,
  ClientEvents,
  ClientOptions,
  IntentsString,
} from 'discord.js';
import type { EventContext } from './contexts';

export interface ClientInterface {
  readonly self: Client;
  login: () => Promise<void>;
}

export interface Config {
  /**
   * Your Discord bot token. **DO NOT SHARE THIS TOKEN TO ANYONE.**
   *
   * It's recommended to use env files and access `process.env` instead.
   *
   * @see {@link https://discord.com/developers/applications Discord Developer Portal}
   *
   * @example
   * // In a file called ".env", put this line:
   * // DISCORD_BOT_TOKEN=my-discord-bot-token-here
   * // Then use `process.env.DISCORD_BOT_TOKEN` instead.
   * const { defineConfig } = require('@chookscord/framework');
   *
   * module.exports = defineConfig({
   *   token: process.env.DISCORD_BOT_TOKEN,
   * });
   */
  token: string;
  intents: IntentsString[];
  /** Placeholder store for 3rd party site credentials. */
  credentials?: Record<string, string>;
  /** Default prefix for non-slash commands. */
  prefix?: string;
  /**
   * Custom non-slash command message validator.
   *
   * Return `true` to continue with the command.
   */
  validateMessage?: (
    ctx: EventContext,
    ...args: ClientEvents['messageCreate']
  ) => Awaited<boolean>;
  /** Extra client options. */
  client?: {
    /** Extra config that will be passed to the Discord.js client. */
    config?: Omit<ClientOptions, 'intents'>;
  };
}

export interface Utils {
  readonly config: Config;
  readonly client: Client;
}
