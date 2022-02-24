# User Commands

**User Commands** are simple commands that lets you perform a specific action on a user.

Unlike **Slash Commands**, the names for these commands can contain <u>mixed cases and spaces</u>.

Since these commands are very basic by design, the scope of the actions they can perform are extremely
specific, but very convenient to execute.

These commands live in the `users` directory, and use the `defineUserCommand` **Definition Function**
for type support.

::: tip
For more advanced uses, visit the [Setup Method](../../advanced/setup/README.md) guide.
:::

## Basic Command

:::: code-group
::: code-group-item users/high-five.ts
@[code](./high-five.ts)
:::
::: code-group-item users/high-five.js
@[code js](./high-five.mjs)
:::
::: code-group-item users/high-five.js (CJS)
@[code js](./high-five.cjs)
:::
::::
