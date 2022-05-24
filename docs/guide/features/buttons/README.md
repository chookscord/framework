# Buttons

**Buttons** allows you to create reusable actions that are easily available to your users.

Like [Modals](../modals/), Buttons are handled in two parts: <u>Creating buttons</u> and <u>Handling
button clicks</u>. The first part is also provided by [Discord.JS](https://discordjs.guide/interactions/buttons.html),
and only the latter is handled by the framework.

## Creating Buttons

::: tip
Buttons can be attached to any command interaction, meaning you can reuse the same handler
across multiple commands.
:::

:::: code-group
::: code-group-item commands/joke.ts
@[code ts{2,11-15,22}](./creating-buttons.ts)
:::
::: code-group-item commands/joke.js
@[code js{2,11-15,22}](./creating-buttons.js)
:::
::: code-group-item commands/joke.js (CJS)
@[code js{2,11-15,22}](./creating-buttons.cjs)
:::
::::

## Handling Button Clicks

:::: code-group
::: code-group-item buttons/tags.ts
@[code ts{5}](./button.ts)
:::
::: code-group-item buttons/tags.js
@[code js{4}](./button.js)
:::
::: code-group-item buttons/tags.ts (CJS)
@[code js{4}](./button.cjs)
:::
::::
