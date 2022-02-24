# Slash Subcommands

**Slash Subcommands** are a very powerful extension to regular [Slash Commands](../slash-commands/README.md)
where similar **Subcommands** can be grouped together, providing an interface to users to do multiple related
actions under similar names.

Creating Slash Subcommands is where the <u>Declarative Interface</u> that Chooksie provides really shine.
It allows you to easily compose multiple Subcommands together without being forced to write them in a single
place.

These commands live in the `subcommands` directory, and use the `defineSlashSubcommand` **Definition
Function** for type support.

For type support for **Subcommands** and **Subcommand Groups**, you can use the `defineSubcommand` and
`defineSubcommandGroup` **Definition Functions** respectively.

::: tip
For more advanced uses, visit the [Setup Method](../../advanced/setup/README.md) guide.
:::

## Subcommands (Inlined)

:::: code-group
::: code-group-item subcommands/string.ts
@[code ts{14-33}](./string-inlined.ts)
:::
::: code-group-item subcommands/string.js
@[code js{14-33}](./string-inlined.mjs)
:::
::: code-group-item subcommands/string.js (CJS)
@[code js{14-33}](./string-inlined.cjs)
:::
::::

## Subcommands (Composed)

:::: code-group
::: code-group-item subcommands/string.ts
@[code ts{10-19,21-30,36-37}](./string-composed.ts)
:::
::: code-group-item subcommands/string.js
@[code js{10-19,21-30,36-37}](./string-composed.mjs)
:::
::: code-group-item subcommands/string.js (CJS)
@[code js{10-19,21-30,36-37}](./string-composed.cjs)
:::
::::
