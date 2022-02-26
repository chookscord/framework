# Autocompletes

**Autocompletes** provides your bot the ability to give your users a helpful interface which shows what
values are valid / provide the best result / relevant to the command.

It is a powerful tool that is capable of providing massive quality of life improvements as it is able to
remove the guesswork or shine light on possible or better answers that might have otherwise been completely
skipped.

Autocompletes are only available in **String**, **Number**, and **Integer** options, and can use the
`defineOption` **Definition Function** for extended type support.

::: tip
For more advanced uses, visit the [Setup Method](../../advanced/setup/README.md) guide.
:::

## Username Autocomplete

:::: code-group
::: code-group-item subcommands/users.ts
@[code ts{19-34}](./autocomplete.ts)
:::
::: code-group-item subcommands/users.js
@[code js{19-34}](./autocomplete.mjs)
:::
::: code-group-item subcommands/users.js (CJS)
@[code js{19-34}](./autocomplete.cjs)
:::
::::
