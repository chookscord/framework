# chooksie

## Fast Discord.JS Framework

[![npm (scoped)](https://img.shields.io/npm/v/chooksie)](https://npmjs.com/package/chooksie)
[![npm](https://img.shields.io/npm/dt/chooksie)](https://npmjs.com/package/chooksie)
[![Discord Server](https://discord.com/api/guilds/942452845322600569/embed.png)](https://discord.gg/24Kh8sf8hu)
[![GitHub Stars](https://img.shields.io/github/stars/chookscord/framework?style=social)](https://github.com/chookscord/framework)

## Features

- :rocket: Simple, Declarative Interface
- :muscle: Powerful Application Command Integration
- :hammer: First Class TypeScript Support
- :fire: Hot Command Reloading

## Why is it fast?

### Writing Code

Chooksie achieves a minimal interface by bringing commands down to their most basic form: Objects.

This not only gives us the advantage of being able to write commands declaratively, but also provide
amazing intellisense without making users write TypeScript code.

```js
import { defineSlashCommand } from 'chooksie'

export default defineSlashCommand({
  name: 'ping',
  description: 'Pong!',
  async execute(ctx) {
    await ctx.interaction.reply('Pong!')
  },
})
```

### Development

Chooksie comes with a powerful development server that provides lots of quality of life features, including:

- Instant code compilation with SWC,
- Real-time command syncing with Discord,
- First class scripting support, and
- Hot code reloading

All these features combined leads to a development experience that allows you to continuously write code
without having to restart, reload, or update your application.

### Production

Chooksie is written from scratch with support for Discord Application Commands in mind, this means we only
have to optimize for a small set of features, leaving us with a tiny core library whose only job is to load
your code and let Discord.JS handle the rest.

## Quick Start

Using the [`create-chooks-bot`](https://npmjs.com/package/create-chooks-bot) scaffold:

```sh
# Create a new bot using the scaffold package
$ npm create chooks-bot my-bot

# Start your new bot
$ cd my-bot
$ npm run dev
```

Using the [CLI tool](https://npmjs.com/package/@chookscord/cli):

```sh
# Install the CLI tool
$ npm i -g @chookscord/cli

# Create a new bot using the CLI tool
$ chooks init my-bot

# Start your new bot
$ cd my-bot
$ chooks
```

## Documentation

Visit the guide at <https://guide.chooks.app> for more info.

## License

MIT
