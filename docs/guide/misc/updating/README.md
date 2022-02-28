# Updating from v1 to v2

## Framework version

:::: code-group
::: code-group-item NPM
@[code](./update-npm.sh)
:::
::: code-group-item Yarn
@[code](./update-yarn.sh)
:::
::: code-group-item PNPM
@[code](./update-pnpm.sh)
:::
::::

## ES Modules

True **ES Module** support by setting `"type": "module"` in `package.json` has been temporarily removed.

Existing ESM-style code (`import`/`export`) still works, but top-level await and importing packages written
in pure ESM are currently not supported.

::: tip
To keep track of this feature, visit [**feat: Reimplement support for true ESM mode**](https://github.com/chookscord/framework/issues/48)
:::

:::: code-group
::: code-group-item package.json

```diff
- "type": "module"
```

:::
::::

## Config

Credentials have been simplified and no longer need **Application IDs** to be defined.

:::: code-group
::: code-group-item chooks.config.ts
@[code](./config/config.ts.diff)
:::
::: code-group-item chooks.config.js
@[code](./config/config.mjs.diff)
:::
::: code-group-item chooks.config.js (CJS)
@[code](./config/config.cjs.diff)
:::
::::

## Subcommands

**Subcommands** were renamed from `SubCommand` to `Subcommand`.

```diff
- const subcommand = defineSubCommand()
+ const subcommand = defineSubcommand()

- const subcommand: ChooksSubCommandOption
+ const subcommand: Subcommand

- const group = defineSubCommandGroup()
+ const group = defineSubcommandGroup()

- const group: ChooksCommandGroupOption
+ const group: SubcommandGroup
```

## Context Commands

**Context Commands** are now split to **User** and **Message Commands**, and the `contexts` directory
are now split to `users` and `messages` directories respectively.

### Migrating User Commands

1. Move user commands to `users` directory
2. Switch from `defineContextCommand` to `defineUserCommand`
3. Remove the `type` prop (Optional).

#### Old User Commands

:::: code-group
::: code-group-item contexts/first-word.ts
@[code ts{1,3,5}](./contexts/old/user.ts)
:::
::: code-group-item contexts/first-word.js
@[code js{1,3,5}](./contexts/old/user.mjs)
:::
::: code-group-item contexts/first-word.js (CJS)
@[code js{1,3,5}](./contexts/old/user.cjs)
:::
::::

#### New User Commands

:::: code-group
::: code-group-item users/first-word.ts
@[code ts{1,3,5}](./contexts/new/user.ts)
:::
::: code-group-item users/first-word.js
@[code js{1,3,5}](./contexts/new/user.mjs)
:::
::: code-group-item users/first-word.js (CJS)
@[code js{1,3,5}](./contexts/new/user.cjs)
:::
::::

### Migrating Message Commands

1. Move message commands to `messages` directory
2. Switch from `defineContextCommand` to `defineMessageCommand`
3. Remove the `type` prop (Optional).

#### Old Message Commands

:::: code-group
::: code-group-item contexts/high-five.ts
@[code ts{1,3,5}](./contexts/old/message.ts)
:::
::: code-group-item contexts/high-five.js
@[code js{1,3,5}](./contexts/old/message.mjs)
:::
::: code-group-item contexts/high-five.js (CJS)
@[code js{1,3,5}](./contexts/old/message.cjs)
:::
::::

#### New Message Commands

:::: code-group
::: code-group-item users/high-five.ts
@[code ts{1,3,5}](./contexts/new/message.ts)
:::
::: code-group-item users/high-five.js
@[code js{1,3,5}](./contexts/new/message.mjs)
:::
::: code-group-item users/high-five.js (CJS)
@[code js{1,3,5}](./contexts/new/message.cjs)
:::
::::

## Options

The following options have been updated:

| Old Name                  | New Name                                                             |
| ------------------------- | -------------------------------------------------------------------- |
| ChooksOption              | Option                                                               |
| ChooksChoice              | Choice                                                               |
| defineNonCommandOption    | defineOption                                                         |
| ChooksOptionWithChoice    | StringOption, NumberOption                                           |
| ChooksOptionWithoutChoice | UserOption, BoolOption, ChannelOption, RoleOption, MentionableOption |
| ChooksNonCommandOption    | NonCommandOption                                                     |

## Contexts

The following contexts have been updated:

| Old Name                    | New Name       |
| --------------------------- | -------------- |
| ChooksContext               | Context        |
| ChooksEventContext          | EventContext   |
| ChooksCommandContext        | CommandContext |
| ChooksContextCommandContext | **N/A**        |

## Scripts

`defineLifecycle` has been renamed to `defineOnLoad`, `ChooksLifecycle` is now `OnLoad`, and `ChooksTeardown`
is now removed.

:::: code-group
::: code-group-item ES Modules

```diff
- export const chooksOnLoad = defineLifecycle()
+ export const chooksOnLoad = defineOnLoad()

- export const chooksOnLoad: ChooksLifecycle
+ export const chooksOnLoad: OnLoad

- export function chooksOnLoad(ctx: ChooksContext) {}
+ export function chooksOnLoad(ctx: Context) {}

- const teardown: ChooksTeardown
```

:::
::: code-group-item CommonJS

```diff
- exports.chooksOnLoad = defineLifecycle()
+ exports.chooksOnLoad = defineOnLoad()

- exports.chooksOnLoad: ChooksLifecycle
+ exports.chooksOnLoad: OnLoad

- exports.chooksOnLoad = (ctx: ChooksContext) => {}
+ exports.chooksOnLoad = (ctx: Context) => {}

- const teardown: ChooksTeardown
```

:::
::::

## Log Levels

Log levels `success` and `log` are now removed. Use `info` or `debug` instead.

```diff
- ctx.logger.log('Logging something')
+ ctx.logger.debug('Logging something')

- ctx.logger.success('Ponged!')
+ ctx.logger.info('Ponged!')
```

## Fetch API

The package `@chookscord/fetch` has been merged to `chooksie/fetch`, and requires [`undici`](https://npmjs.com/package/undici)
to be installed.

Additionally, `fetch` is no longer available in `Context` objects by default.

:::: code-group
::: code-group-item NPM
@[code](./undici-npm.sh)
:::
::: code-group-item Yarn
@[code](./undici-yarn.sh)
:::
::: code-group-item PNPM
@[code](./undici-pnpm.sh)
:::
::::

:::: code-group
::: code-group-item ES Module

```diff
import { defineOnLoad } from 'chooksie'
- import { fetch } from '@chookscord/fetch'
+ import { fetch } from 'chooksie/fetch'

export const chooksOnLoad = defineOnLoad(async ctx => {
-  await ctx.fetch('https://example.com')
+  await fetch('https://example.com')
})
```

:::
::: code-group-item CommonJS

```diff
const { defineOnLoad } = require('chooksie')
- const { fetch } = require('@chookscord/fetch')
+ const { fetch } = require('chooksie/fetch')

exports.chooksOnLoad = defineOnLoad(async ctx => {
-  await ctx.fetch('https://example.com')
+  await fetch('https://example.com')
})
```

:::
::::
