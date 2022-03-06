import { defineConfig } from 'chooksie'

export default defineConfig({
  token: process.env.BOT_TOKEN,
  devServer: process.env.DEV_SERVER,
  intents: [],
})
