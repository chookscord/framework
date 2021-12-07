# {project_name}

A Discord Bot using the [chooksie](https://github.com/chookscord/framework) framework.  
Scaffolded using @chookscord/cli v{chookscord_cli_version}.

> For a more in-depth guide, check out the [guide](https://guide.chooks.app/).

## Scripts

### {manager_run} dev

Starts your bot in development mode.

### {manager_run} build

Compiles a standalone production version of your bot without the need for the CLI tool.

### {manager_start} start

Starts your bot in production mode.

### {manager_run} register

Register your Discord interactions globally.

## Project Structure

### chooks.config.{lang}

The config file where you set for your bot.

> definitions: `defineConfig`

### commands

The folder that holds all your regular slash commands.

> definitions: `defineSlashCommand`

### subcommands

The same as commands but for use with subcommands.

> definitions: `defineSlashSubCommand`, `defineSubCommand`

### contexts

The folder that holds all your context menu commands.

> definitions: `defineContextCommand`

### events

The folder where you define event handlers to attach to your client.

> definitions: `defineEvent`

## Startup Scripts

All files not in any of the folders above (excluding files in the project's
root) are loaded on startup, and a special exported function named
`chooksOnLoad` is always run on start / file update, with the default context
passed as its first parameter, allowing you to access your `client` on load.

Additionally, any returned function is executed when the file is reloaded,
useful for tearing down web servers, stopping timers, etc.
