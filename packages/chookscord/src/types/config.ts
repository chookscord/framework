import { ClientOptions, IntentsString } from 'discord.js';

export interface BotCredentials {
  /**
   * Your Discord bot token. **DO NOT SHARE THIS TOKEN TO ANYONE.**
   *
   * It's recommended to use env files and access `process.env` instead.
   *
   * @example
   * // In a file called ".env", put this line:
   * // DISCORD_BOT_TOKEN=my-discord-bot-token-here
   * // Then use `process.env.DISCORD_BOT_TOKEN` instead.
   * const { defineConfig } = require('chookscord');
   *
   * module.exports = defineConfig({
   *   authorization: {
   *     token: process.env.DISCORD_BOT_TOKEN,
   *   },
   * });
   */
  token: string;
  /**
   * Your bot's application ID. This is separate from your bot token.
   *
   * This is required to register your slash commands,
   * since it's separate from your bot client.
   */
  applicationId: string;
}

export interface Config {
  /**
   * Your application credentials. These are essential to make your bot function.
   *
   * You can get the following data from the {@link https://discord.com/developers/applications Discord Developer Portal}
   */
  credentials: BotCredentials;
  /** The intents your bot will use. */
  intents: IntentsString[];
  /** The discord server to register your slash commands to while developing. */
  devServer?: string;
  /** Extra client options. */
  client?: {
    /** Extra config that will be passed to the Discord.js client. */
    config?: Omit<ClientOptions, 'intents'>;
  };
}
