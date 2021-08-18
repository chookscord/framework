import { defineConfig } from 'chookscord';

export default defineConfig({
  prefix: process.env.DISCORD_BOT_PREFIX,
  devServer: process.env.DISCORD_DEV_SERVER,
  credentials: {
    token: process.env.DISCORD_BOT_TOKEN,
    applicationId: process.env.DISCORD_APP_ID,
  },
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
  ],
});
