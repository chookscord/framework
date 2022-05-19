# Modals

**Modals** allows your users to use an interface to easily fill out forms, useful for filling out complex
inputs or very large texts.

Modals are handled in two parts: <u>Creating the form</u> and <u>Handling submissions</u>. The first part
is provided by [Discord.JS](https://discordjs.guide/interactions/modals.html#building-and-responding-with-modals)
and only the latter is handled by the framework, reason being much like [Embeds](https://discordjs.guide/popular-topics/embeds.html),
forms can be dynamically created, allowing you to freely handle and create modals while easily handling
submissions in a single location.

## Creating Modals

::: tip
Modals can be attached to any command interaction, meaning you can reuse the same handler
across multiple commands.
:::

:::: code-group
::: code-group-item messages/tags.ts
@[code ts{2-3,8-11,25}](./creating-modals.ts)
:::
::: code-group-item messages/tags.js
@[code js{2,7-10,24}](./creating-modals.js)
:::
::: code-group-item messages/tags.js (CJS)
@[code js{2,7-10,24}](./creating-modals.cjs)
:::
::::

## Handling Modal Submits

:::: code-group
::: code-group-item modals/tags.ts
@[code ts{4,8-9}](./modal.ts)
:::
::: code-group-item modals/tags.js
@[code js{4,8-9}](./modal.js)
:::
::: code-group-item modals/tags.ts (CJS)
@[code js{4,8-9}](./modal.cjs)
:::
::::
