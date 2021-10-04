# chookscord

The next generation Discord.JS Framework for advanced and rapid bot development.

[![npm (scoped)](https://img.shields.io/npm/v/chookscord)](https://npmjs.com/package/chookscord)
[![npm](https://img.shields.io/npm/dt/chookscord)](https://npmjs.com/package/chookscord)

## This project is still experimental!

A lot of stuff is still under construction, and documentation is still very
lacking. Stuff may change at any moment without warning, so consider holding
on to deploying to production until **v1.x.x** is up!

## Features

- First class TypeScript support
- Support for slash commands and context menus
- Hot command reloading. Instantly reloads even your TypeScript files
- Zero boilerplate. No constructing classes, no unnecessary imports
- Auto registers interactions

## Modules

Exporting untyped interactions objects are accepted, meaning you don't need to
import/declare any useless boilerplate, you just define what your interactions to
look like.

- Minimal sample command:

```js
// commands/hello.js
module.exports = {
  name: 'hello',
  description: 'My basic command.',
  async execute(ctx) {
    await ctx.interaction.reply('Hello, world!');
  },
};
```

But of course, working blind isn't really productive, so you can import helper
functions that will provide you with types!

- Minimal typed sample command:

```js
// commands/hello-world.js
const { defineCommand } = require('chookscord');

module.exports = defineCommand({
  // Now you can see what fields you need to add!
  name: 'hello',
  description: 'My basic command.',
  async execute(ctx) {
    // You can also see what the "ctx" context contains and their properties!
    await ctx.interaction.reply('Hello, world!');
  },
});
```

- Minimal sample command in TypeScript:

```ts
// commands/hello-world.ts
import { defineCommand } from 'chookscord';

// The same thing above but in TypeScript
export default defineCommand({
  name: 'hello',
  description: 'My basic command.',
  async execute(ctx) {
    await ctx.interaction.reply('Hello, world!');
  },
});
```

## Getting started

This project recommends using [**yarn**](https://yarnpkg.com/) as your package
manager for a better dev experience.

```bash
$ yarn add chookscord
```

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

These should expose all the commands the framework has included.

### Scripts

```bash
# Start your bot in development mode
$ chooks

# Start your bot in production mode
$ chooks start

# Compile your bot's source for production
$ chooks build

# Register your commands globally (needs files to be built first)
$ chooks register
```

## Directory Structure

The framework automatically loads files from specific directories, so no need
to implement your own handlers.

### Config file

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

The `commands` folder should contain all your slash commands.

All command handlers will have the `interaction` object available in
their context.

#### Slash command `/ping`

```js
// commands/ping.js
const { defineCommand } = require('chookscord');

module.exports = defineCommand({
  name: 'ping',
  description: 'Replies with pong!',
  async execute({ interaction }) {
    await interaction.reply('pong!');
  },
});
```

### Subcommands

The `subcommands` folder is where you would put your subcommands.

It has the same context as `commands`.

#### Subcommands `/say hi` and `/say hello there`

```js
// subcommands/greet.js
const { defineSubCommand } = require('chookscord');

module.exports = defineSubCommand({
  name: 'say',
  description: 'Says a greeting.',
  options: [
    {
      name: 'hi',
      description: 'Says hi.',
      type: 'SUB_COMMAND', // Option types are always required!
      async execute({ interaction }) {
        await interaction.reply('Hi!');
      },
    },
    {
      name: 'hello',
      type: 'SUB_COMMAND_GROUP', // Mixing subcommand groups are OK!
      description: 'Says hello.',
      options: [
        {
          name: 'there',
          description: 'Says hello there.',
          type: 'SUB_COMMAND',
          async execute({ interaction }) {
            await interaction.reply('Hello there!');
          },
        },
      ],
    },
  ],
});
```

### Context commands

The `contexts` folder is where you would put your context commands.

Context commands shows up when you open up the context menu on messages or users
(right click or tapping a message or user).

The `interaction` in this context is a `ContextMenuInteraction` object.

#### Message command `First Word`

```js
// contexts/first-word.js
const { defineContextCommand } = require('chookscord');

module.exports = defineContextCommand({
  name: 'First Word', // Uppercase and spaces are allowed.
  type: 'MESSAGE', // Specifying type MESSAGE makes this available in messages contexts.
  async execute({ interaction }) {
    // Get the message from where this command was ran
    const message = interaction.options.getMessage('message');

    const firstWord = message.content.split(' ')[0];
    await interaction.reply(`The first word was "${firstWord}"!`);
  },
});
```

#### User command `High Five`

```js
// contexts/high-five.js
const { defineContextCommand } = require('chookscord');

module.exports = defineContextCommand({
  name: 'High Five',
  type: 'USER', // Specify the type as USER to make it show up in users instead.
  async execute({ interaction }) {
    // Get the user where this command was ran
    const target = interaction.options.getUser('user');
    const user = interaction.user;

    await interaction.reply({
      content: `<@${user.id}> high fived <@${target.id}>!`,
      allowedMentions: {
        users: [],
      },
    });
  },
});
```

### Events

The `events` folder should contain all your event handlers.

Attaching multiple listeners to a single event is not supported.

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
│   └── ping.js
├── contexts
│   ├── first-word.js
│   └── high-five.js
├── events
│   └── ready.js
├── subcommands
│   └── greet.js
├── .env
├── chooks.config.js
└── package.json
```

Now you can start your bot using `yarn dev`!

## Extras

### Sample Projects

You can go to the [`samples`](https://github.com/chookscord/framework/tree/master/sample)
directory inside the repository to see working templates using javascript or typescript.
