# @chookscord/framework

The **Easiest** Discord.JS Framework by far.

[![npm (scoped)](https://img.shields.io/npm/v/@chookscord/framework)](https://npmjs.com/package/@chookscord/framework)
[![npm](https://img.shields.io/npm/dt/@chookscord/framework)](https://npmjs.com/package/@chookscord/framework)

## This project is still experimental!

A lot of stuff is still under construction, and documentation is still very lacking. Stuff may change at any moment without warning, so consider holding on to deploying to production until **v1.x.x** is up!

### Todo list

Check the [issues](https://github.com/chookscord/framework/issues) tab in the repository.

## Installation

This project recommends using [**yarn**](https://yarnpkg.com/) as your package manager for a better dev experience.

```bash
$ yarn add @chookscord/framework

# OR using npm
$ npm i @chookscord/framework
```

## Usage

In your `package.json` file, add this line to your scripts:

```json
{
  "scripts": {
    "dev": "chooks"
  }
}
```

Now you can run your bot using `yarn dev` or `npm run dev`!

## Directory Structure

The framework automatically loads files from specific directories, so no need to implement your own handlers.

While `module.exports = {}` are enough to define files, this framework contains utilities to provide type support, so you know what things are available in the current context!

### Config

At the root of your project, there should be a `chooks.config.js` or `chooks.config.ts` file.  
This file is **required** as it should contain your bot's token and intents.

***It is highly recommended to use a `.env` file to store your sensitive credentials!***  
You should put your bot token and other sensitive info there instead.

```bash
# .env
DISCORD_BOT_TOKEN=your-bot-token-here
```

```js
// chooks.config.js
const { defineConfig } = require('@chookscord/utils');

module.exports = defineConfig({
  // .env files are automatically loaded
  token: process.env.DISCORD_BOT_TOKEN,
  // the prefix is required if want to use commands other than slash commands.
  prefix: '!',
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
  ],
});
```

### Commands

The `commands` folder should contain all your commands.

```js
// commands/ping.js
const { defineCommand } = require('@chookscord/utils');

module.exports = defineCommand({
  name: 'ping',
  async execute({ message }) {
    await message.channel.send('pong!');
    console.log('channel pinged!');
  },
});
```

### Events

The `events` folder should contain all your event handlers.

```js
// commands/ready.js
const { defineEvent } = require('@chookscord/utils');

module.exports = defineEvent({
  name: 'ready',
  execute({ client }) {
    console.log(`${client.user.username} ready!`);
  },
});
```
