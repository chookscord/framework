# chookscord

The next generation Discord.JS Framework for advanced and rapid development.

[![npm (scoped)](https://img.shields.io/npm/v/chookscord)](https://npmjs.com/package/chookscord)
[![npm](https://img.shields.io/npm/dt/chookscord)](https://npmjs.com/package/chookscord)

## Features

- First class TypeScript support
- Support for slash commands and context menus
- Hot command reloading. Instantly reloads even your TypeScript files
- Zero boilerplate. No constructing classes, no unnecessary imports
- Auto registers interactions

## Documentation

Visit the guide at https://guide.chooks.app for more info.

## Getting started

Initialize your project:

```sh
# Install the framework
$ yarn init -y
$ yarn add chookscord

# Create your files
$ mkdir commands
$ touch chooks.config.js commands/hello-world.js
```

Add the script in your `package.json` file to run your bot:

```json
{
  "scripts": {
    "dev": "chooks"
  }
}
```

Setup your config:

```js
// chooks.config.js
module.exports = {
  credentials: {
    token: 'bot-token',
    applicationId: 'application-id',
  },
  devServer: 'dev-server-id',
  intents: [],
};
```

Create your slash command:

```js
// commands/hello-world.js
module.exports = {
  name: 'hello',
  description: 'My basic slash command!',
  async execute(ctx) {
    await ctx.interaction.reply('Hello, world!');
  },
};
```

Now run your bot using `yarn dev`, and congratulations, you now have a working Discord bot!

Learn more in detail at https://guide.chooks.app/installation.html

## Sample Projects

You can go to the [`samples`](https://github.com/chookscord/framework/tree/master/sample)
directory inside the repository to see working templates using JavaScript or TypeScript.
