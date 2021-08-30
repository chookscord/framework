# chookscord-bot-sample

## Getting started

This short guide assumes you already have NodeJS 16.6+ installed,
along with `npm`.  
The package manager we will be using is `yarn`, all used commands here have
their `npm` counterparts.

If you don't have it already, install `yarn` globally in your system:

```sh
$ npm install -g yarn
```

## Installation

In your new project's root, run `yarn init`, then install `chookscord` as a dependency:

```sh
$ yarn add chookscord
```

## Setup

In your created `package.json` file, add this small `scripts` snippet:

```json
{
  // ...
  "scripts": {
    "dev": "chooks",
    "build": "chooks build",
    "start": "chooks start",
    "register": "chooks register"
  }
}
```

This should now allow you to start your bot using `yarn dev`.

To deploy your bot, run `yarn build` then `yarn register` to register your
interactions globally, then run `yarn start` to start your bot in production mode.

## Files

This guide won't include code snippets, refer to the individual files to see how
each file is structured.

### Config

Your config should be located at `chooks.config.js`, or `chooks.config.dev.js`
if you want to use a separate config during development.

### Commands

All commands live in the `commands` directory. You can group related commands
to their own directory inside `commands` and still have it loaded without any change.

#### Note

This might change soon to give way for subcommands!

### Events

All event handles should be inside the `events` folder. You can use any file name
you want, it doesn't have to exactly match the event name.
