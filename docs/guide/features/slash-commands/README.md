# Slash Commands

For most bots, **Slash Commands** will be the bread and butter of their bot's features. Its usage is very
basic but can be extended by **Options** to accept user input and change the response.

These commands live in the `commands` directory, and use the `defineSlashCommand` **Definition Function**
for type support.

::: tip
For more advanced uses, visit the [Setup Method](../../advanced/setup/README.md) guide.
:::

## Basic Command

:::: code-group
::: code-group-item commands/ping.ts
@[code](./ping.ts)
:::
::: code-group-item commands/ping.js
@[code js](./ping.mjs)
:::
::: code-group-item commands/ping.js (CJS)
@[code js](./ping.cjs)
:::
::::

## With Options

:::: code-group
::: code-group-item commands/echo.ts
@[code](./echo.ts)
:::
::: code-group-item commands/echo.js
@[code js](./echo.mjs)
:::
::: code-group-item commands/echo.js (CJS)
@[code js](./echo.cjs)
:::
::::
