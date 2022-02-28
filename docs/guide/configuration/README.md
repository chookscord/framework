# Configuration

Chooksie is an opinionated framework, meaning a lot of values are managed by the framework
to provide the developer a very integrated experience with little to no configuration.

That said, these are the options available in your `chooks.config` file:

## token

> `string`

Your Discord bot token.

## intents

> `IntentsString[]`

Your bot's intents.

## devServer

> `string` optional

The Discord server ID you plan to work in. Required in development mode.

## client.options

> `Omit<ClientOptions, 'intents'>` optional

Additional options to pass to Discord.JS's `Client`.
