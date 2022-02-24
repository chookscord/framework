# Message Commands

**Message Commands** are similar to [User Commands](../user-commands/README.md) in a way that they perform
a single, specific action on a message.

Like **User Commands**, the names for these commands can contain <u>mixed cases and spaces</u>.

These commands live in the `messages` directory, and use the `defineMessageCommand` **Definition Function**
for type support.

::: tip
For more advanced uses, visit the [Setup Method](../../advanced/setup/README.md) guide.
:::

## Basic Command

:::: code-group
::: code-group-item messages/first-word.ts
@[code](./first-word.ts)
:::
::: code-group-item messages/first-word.js
@[code js](./first-word.mjs)
:::
::: code-group-item messages/first-word.js (CJS)
@[code js](./first-word.cjs)
:::
::::
