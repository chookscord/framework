# Buttons

**Buttons** allows your users to use an interface to easily fill out forms, useful for filling out complex
inputs or very large texts.

Buttons are handled in two parts: <u>Creating the form</u> and <u>Handling submissions</u>. The first part
is provided by [Discord.JS](https://discordjs.guide/interactions/modals.html#building-and-responding-with-modals)
and only the latter is handled by the framework, reason being much like [Embeds](https://discordjs.guide/popular-topics/embeds.html),
forms can be dynamically created, allowing you to freely handle and create modals while easily handling
submissions in a single location.

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
