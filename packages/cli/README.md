# @chookscord/cli

## Development tool kit for the [Chooksie](https://npmjs.com/package/chooksie) Framework

> Provides the core functionalities during the development process, leaving a tiny lib in production mode.

Exposes a CLI command `chooks` that interfaces with various parts of the framework.

## Installation

```sh
# Global installation, recommended for most users
$ npm i -g @chookscord/cli

# Per-project installation, recommended when you need to build
# from source like in CI/CD envs, etc.
$ npm i -D @chookscord/cli
```

## API Reference

### `chooks`

Starts your application in development mode.

Stores cached files in `.chooks` directory.

### `chooks init`

Creates a new application.

### `chooks build`

Creates a production build of your application.

Outputs build files to `dist` directory.

### `chooks register`

Registers your Discord Application Commands globally.

Requires a production build using `chooks build` to be present.

## License

MIT
