import { defineConfig } from 'chooksie';

export default defineConfig({
  credentials: {
    token: process.env.DISCORD_BOT_TOKEN,
    applicationId: process.env.DISCORD_APP_ID,
  },
  devServer: process.env.DISCORD_DEV_SERVER,
  intents: [],
});
