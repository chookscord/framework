# chookscord

The **Easiest** Discord.JS Framework by far.

[![npm (scoped)](https://img.shields.io/npm/v/chookscord)](https://npmjs.com/package/chookscord)
[![npm](https://img.shields.io/npm/dt/chookscord)](https://npmjs.com/package/chookscord)

## This project is still experimental!

A lot of stuff is still under construction, and documentation is still very lacking. Stuff may change at any moment without warning, so consider holding on to deploying to production until **v1.x.x** is up!

### Notice

Slash commands are currently broken (0.3.x). Will be fixed in 0.4.x.

### Todo list

Check the [issues](https://github.com/chookscord/framework/issues) tab in the repository.

## Installation

This project recommends using [**yarn**](https://yarnpkg.com/) as your package manager for a better dev experience.

```bash
$ yarn add chookscord

# OR using npm
$ npm i chookscord
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
const { defineConfig } = require('chookscord');

module.exports = defineConfig({
  // .env files are automatically loaded
  token: process.env.DISCORD_BOT_TOKEN,
  // the prefix is required if want to use the traditional message commands.
  prefix: '!',
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
  ],
});
```

### Commands

The `commands` folder should contain all your commands.

By default, all commands are slash commands and will have the `interaction` object available in their context.

To use the traditional message commands instead, add `text: true` to your options, or use `defineTextCommand`. `interaction` will be replaced with the standard `message` object and `args` which will be whatever input the user sent.

```js
// commands/ping.js
const { defineCommand } = require('chookscord');

module.exports = defineCommand({
  name: 'ping',
  description: 'Replies with pong!',
  async execute({ interaction }) {
    await interaction.reply('pong!');
    console.log('user ponged!');
  },
});
```

```js
// commands/pong.js
const { defineTextCommand } = require('chookscord');

module.exports = defineTextCommand({
  text: true,
  name: 'pong',
  description: 'Replies with ping!',
  async execute({ message }) {
    await message.reply('ping!');
    console.log('user pinged!');
  },
});
```

### Events

The `events` folder should contain all your event handlers.

```js
// commands/ready.js
const { defineEvent } = require('chookscord');

module.exports = defineEvent({
  name: 'ready',
  execute({ client }) {
    console.log(`${client.user.username} ready!`);
  },
});
```

### Final structure

Once all that is set up, your project should now look a bit like this:

```bash
.
├── node_modules
├── commands
│   ├── ping.js
│   └── pong.js
├── events
│   └── ready.js
├── .env
├── chooks.config.js
├── package.json
└── yarn.lock
```

Now you can start your bot using `yarn dev`!
