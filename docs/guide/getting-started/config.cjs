const { defineConfig } = require('chooksie')

module.exports = defineConfig({
  token: process.env.BOT_TOKEN,
  devServer: process.env.DEV_SERVER,
  intents: [],
})
