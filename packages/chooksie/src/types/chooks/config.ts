/* eslint-disable no-trailing-spaces */
import { ClientOptions, IntentsString } from 'discord.js';

export interface BotCredentials {
  /**
   * Your Discord bot token. **DO NOT SHARE THIS TOKEN TO ANYONE.**  
   * It is recommended to use environment variables and access `process.env` instead.
   *
   * @example
   * const { defineConfig } = require('chooksie');
   *
   * module.exports = defineConfig({
   *   credentials: {
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

export interface ChooksConfig {
  /**
   * Your application credentials. These are essential to make your bot function.  
   * You can get the following data from the [Discord Developer Portal](https://discord.com/developers/applications).
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
