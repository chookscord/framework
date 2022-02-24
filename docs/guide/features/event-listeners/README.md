# Event Listeners

**Event Listeners** are modules that are basically passed onto Discord.JS's [Events](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-apiRequest).

Event listeners live in the `events` directory, and use the `defineEvent` **Definition Function**
for type support.

::: tip
For more advanced uses, visit the [Setup Method](../../advanced/setup/README.md) guide.
:::

## Basic Listeners

:::: code-group
::: code-group-item events/guild-create.ts
@[code](./guild-create.ts)
:::
::: code-group-item events/guild-create.js
@[code js](./guild-create.mjs)
:::
::: code-group-item events/guild-create.js (CJS)
@[code js](./guild-create.cjs)
:::
::::

## One-time Listeners

:::: code-group
::: code-group-item events/ready.ts
@[code ts{5}](./ready.ts)
:::
::: code-group-item events/ready.js
@[code js{5}](./ready.mjs)
:::
::: code-group-item events/ready.js (CJS)
@[code js{5}](./ready.cjs)
:::
::::
