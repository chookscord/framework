# CLI Tool

The CLI tool contains a bunch of commands essential for development.

You can access the command by using `npx chooks` when installed locally, or use `chooks` directly when
using it inside `scripts` in your `package.json` or when installed globally.

## chooks

Starts your bot in development mode.

<!-- markdownlint-disable-next-line MD001 MD026 -->
#### Features available when in development mode:

- Tracks and updates your files in real time.
- Syncs commands to Discord when changes are detected.
- Accepts and prioritizes loading `chooks.config.dev.ts` and `chooks.config.dev.js` config files.
- Compiles your files into a directory named `.chooks`.
- Outputs logs to `.chooks/chooks.log`.
- Caches command data in `.chooks/.chooksinfo` for future logins.

## chooks init [name]

Creates a new bot application.

Optionally accepts a param that will be used as the application's name and
directory (only if the directory is empty).

## chooks build

Creates a production build of your bot.

Checks and validates if your commands are valid and exits if it finds an invalid command.

Outputs build artifacts to `dist`.

## chooks register

Registers your application commands to Discord globally.

Searches for commands in the `dist` directory.
