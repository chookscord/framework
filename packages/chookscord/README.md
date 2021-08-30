# chookscord

The **Easiest** Discord.JS Framework by far.

[![npm (scoped)](https://img.shields.io/npm/v/chookscord)](https://npmjs.com/package/chookscord)
[![npm](https://img.shields.io/npm/dt/chookscord)](https://npmjs.com/package/chookscord)

## This project is still experimental!

A lot of stuff is still under construction, and documentation is still very
lacking. Stuff may change at any moment without warning, so consider holding
on to deploying to production until **v1.x.x** is up!

### Todo list

Check the [issues](https://github.com/chookscord/framework/issues) tab in the repository.

## Installation

This project recommends using [**yarn**](https://yarnpkg.com/) as your package
manager for a better dev experience.

```bash
$ yarn add chookscord

# OR using npm
$ npm i chookscord
```

## Usage

In your `package.json` file, add the following lines to your scripts:

```json
{
  "scripts": {
    "dev": "chooks",
    "build": "chooks build",
    "start": "chooks start",
    "register": "chooks register"
  }
}
```

`yarn dev` would start your bot in development mode, meaning it'll have Hot Reload
and Auto Interaction Register enabled. This should only be used while developing
your bot since it registers interactions on startup and will not register your
interactions globally!

`yarn build` will build your project without running your bot. Useful for
deploying to production.

`yarn start` will start your bot in production mode. This will be a bit more
efficient that development mode since there's no file watching and other
unnecessary overheads, and doesn't register interactions on startup!

`yarn register` will register your built commands globally.

To start developing your bot, run `yarn dev`!

## Directory Structure

The framework automatically loads files from specific directories, so no need
to implement your own handlers.

While `module.exports = {}` are enough to define files, this framework contains
utilities to provide type support, so you know what things are available in the
current context!

### Sample File

This framework only relies on exporting objects, so you can make commands without
having to import anything!

* Example minimal command:

```js
// commands/hello-world.js
module.exports = {
  name: 'hello',
  description: 'My basic command.',
  execute(ctx) {
    ctx.interaction.reply('Hello, world!');
  },
};
```

But of course, working blind isn't really productive, so you can import helper
functions that will provide you with types!

* Example minimal command with types:

```js
// commands/hello-world.js
const { defineSlashCommand } = require('chookscord');

module.exports = defineSlashCommand({
  // Now you can see what fields you need to add!
  name: 'hello',
  description: 'My basic command.',
  execute(ctx) {
    // You can also see what the "ctx" context contains and their properties!
    ctx.interaction.reply('Hello, world!');
  },
})
```

### Config

At the root of your project, there should be a `chooks.config.js` or
`chooks.config.ts` file, or `chooks.config.dev.js` or `chooks.config.dev.ts`
while developing.

This file is **required** as it should contain your bot's token and intents.

***It is highly recommended to use a `.env` file to store your
sensitive credentials!***  
You should put your bot token and other sensitive info there instead.

```bash
# .env
# Put your other credentials here as well
DISCORD_BOT_TOKEN=your-bot-token-here
```

```js
// chooks.config.js
const { defineConfig } = require('chookscord');

module.exports = defineConfig({
  // .env files are automatically loaded
  credentials: {
    token: process.env.DISCORD_BOT_TOKEN,
    // your application id should be the "General Information" tab
    // this is required for registering slash commands
    applicationId: process.env.DISCORD_APPLICATION_ID,
  },
  // a discord server where you would be doing most of the testing
  // slash commands are registered here instantly while developing
  devServer: process.env.DISCORD_DEV_SERVER,
  intents: [],
});
```

### Commands

The `commands` folder should contain all your commands.

By default, all commands are slash commands and will have the `interaction`
object available in their context.

#### Slash command `/ping`

```js
// commands/ping.js
const { defineSlashCommand } = require('chookscord');

module.exports = defineSlashCommand({
  name: 'ping',
  description: 'Replies with pong!',
  async execute({ interaction }) {
    await interaction.reply('pong!');
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
  execute({ logger, client }) {
    logger.info(`${client.user.username} ready!`);
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
├── events
│   └── ready.js
├── .env
├── chooks.config.js
├── package.json
└── yarn.lock
```

Now you can start your bot using `yarn dev`!

## Extras

### TypeScript

This framework supports working with `.ts` files out of the box!  
Running dev mode with typescript files will make it automatically compile it to javascript
without any extra config.

### Sample Projects

You can go to the [`samples`](https://github.com/chookscord/framework/tree/master/sample)
directory inside the repository to see working templates using javascript or typescript.
