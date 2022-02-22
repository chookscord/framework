# Getting Started

## Prerequisites

### Required

- [NodeJS](https://nodejs.org/) >=16.9.0

### Optional

- [ESLint](https://www.npmjs.com/package/eslint)
- Package Managers, choose one
  - [Yarn](https://www.npmjs.com/package/yarn) >=1.22.17
  - [PNPM](https://www.npmjs.com/package/pnpm) >=6.32.0

## Installation

### Using the Scaffold

This method is the fastest way to get started.

This is great for first timers or if you only plan to work on one bot at a time.

:::: code-group
::: code-group-item NPM
@[code{2-8}](./npm-install.sh)
:::
::: code-group-item Yarn
@[code{2-8}](./yarn-install.sh)
:::
::: code-group-item PNPM
@[code{2-8}](./pnpm-install.sh)
:::
::::

### Using the CLI Tool

This method is the fastest when developing multiple projects locally.

When deploying to an environment where you need to build from source (CI/CD pipelines),
you need to add `@chookscord/cli` as a dev dependency in your project.

:::: code-group
::: code-group-item NPM
@[code{10-19}](./npm-install.sh)
:::
::: code-group-item Yarn
@[code{10-19}](./yarn-install.sh)
:::
::: code-group-item PNPM
@[code{10-19}](./pnpm-install.sh)
:::
::::

### Manual Installation

If you want to migrate an existing bot or don't want to use any of the methods above.

:::: code-group
::: code-group-item NPM
@[code{21-27}](./npm-install.sh)
:::
::: code-group-item Yarn
@[code{21-27}](./yarn-install.sh)
:::
::: code-group-item PNPM
@[code{21-27}](./pnpm-install.sh)
:::
::::

Expose CLI commands by adding the following scripts to your `package.json`

:::: code-group
::: code-group-item package.json
@[code](./scripts.json)
:::
::::

Place your credentials in an env file:

:::: code-group
::: code-group-item .env
@[code sh](./.env.sample)
:::
::::

Create a config file and use your credentials:

:::: code-group
::: code-group-item chooks.config.ts
@[code](./config.ts)
:::
::: code-group-item chooks.config.js
@[code](./config.js)
:::
::: code-group-item chooks.config.js (CJS)
@[code js](./config.cjs)
:::
::::

If you plan to use TypeScript, you must enable `strict` (or at the very least, `noImplicitThis`)
for `this` context to work.

:::: code-group
::: code-group-item tsconfig.json
@[code](./tsconfig.sample.json)
:::
::::

Once you did all of the above, you can run the `dev` script above and start creating files and
the framework will detect and update your bot.
