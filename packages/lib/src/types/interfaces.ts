import type {
  Client,
  ClientOptions,
  IntentsString,
} from 'discord.js';
import type {
  MessageHandler,
  MessageValidator,
} from '..';

export interface ClientInterface {
  readonly self: Client;
  login: () => Promise<void>;
}

export interface Config {
  /**
   * Your application credentials. These are essential to make your bot function.
   *
   * You can get the following data from the {@link https://discord.com/developers/applications Discord Developer Portal}
   */
  credentials: {
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
     *   token: process.env.DISCORD_BOT_TOKEN,
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
  };
  /** The intents your bot will use. */
  intents: IntentsString[];
  /** The discord server to register your slash commands to while developing. */
  devServer: string;
  /**
   * The default prefix for text commands.
   *
   * You will need to add `GUILDS` and `GUILD_MESSAGES`
   * to your intents in order to recieve guild message events.
   */
  prefix?: string;
  /** Custom handlers for text commands. */
  message?: {
    /**
     * A message validator that should determine
     * whether the message is a valid command or not.
     *
     * @returns {boolean|Promise<boolean>} Whether to continue or not.
     *
     * @example
     * validate(ctx, message) {
     *   return (
     *     !message.author.bot && // We should ignore bot messages
     *     !message.webhookId &&  // We should also ignore webhooks
     *     // The message should be a command if it starts with our prefix
     *     message.content.startsWith(ctx.config.prefix)
     *   );
     * }
     */
    validate?: MessageValidator;
    /**
     * A message handler that should resolve to an array with two items,
     * the `command` and the `args`.
     * If the command doesn't exist, return an empty array.
     *
     * You should only change this **if you know what you're doing**,
     * the default handler should be enough for most cases.
     *
     * @example
     * // Note: this basic example does not resolve subcommands.
     * handler(ctx, getCommand, message) {
     *   // Extract the command name from the message,
     *   // and pass the rest of the content as the command's args
     *   const [commandName, ...args] = message.content
     *     .trim()                          // Remove trailing whitespaces
     *     .slice(ctx.config.prefix.length) // Remove the prefix from the message
     *     .split(/ +/g);                   // Split the message at every space
     *
     *   // Here we get the command from our saved commands
     *   const command = getCommand(commandName);
     *
     *   // If the command does not exist, return an empty array
     *   if (!command) {
     *     return [];
     *   }
     *
     *   // Return the command we found and pass the args as well
     *   return [command, args];
     * }
     */
    handler?: MessageHandler;
  };
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
