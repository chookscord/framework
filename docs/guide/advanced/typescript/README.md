# Usage with TypeScript

While the majority of the framework was designed with type safety in mind without explicit use of
TypeScript features through the use of **Definition Functions**, it is still fully possible to use
Chooksie with full type safety while having **0 runtime imports**.

- All **Definition Functions** have their own corresponding interface, all defined without the `define`
prefix (ie. `defineSlashCommand` will have an interface named `SlashCommand`).

- All **Options** can use the `Option` type, but [Specialized Options](#specialized-options)
like `Subcommand` and those that utilize the [Setup](../setup/README.md) functionality should use their
dedicated interfaces respectively.

## Basic Examples

Basic usage includes everything that doesn't use the `setup` feature, since these do not need any special
type treatment.

### Slash Commands

:::: code-group
::: code-group-item commands/ping.ts
@[code ts{1,3}](./ping.ts)
:::
::::

### Subcommand Groups (Composed)

:::: code-group
::: code-group-item subcommands/string.ts
@[code ts{1,3,10,21,32,42}](./string.ts)
:::
::::

## Examples with Setup

Using inline `setup`s is where **Definition Functions** really do their best in inferring types, as doing it
manually would require you to define the return value manually, or infer them from external functions.

::: tip
Chooksie provides a type util called `InferSetupType` to infer the type of external functions.
:::

### Inline Setup

:::: code-group
::: code-group-item commands/ping.ts
@[code ts{1,3,8}](./setup-inline.ts)
:::
::::

### Reusable Setup

:::: code-group
::: code-group-item commands/ping.ts
@[code ts{1,3-6,8}](./setup-reusable.ts)
:::
::::

## List of Interfaces

::: tip
To see a full list of available types, visit the [Type Reference](https://github.com/chookscord/framework/blob/main/packages/chooksie/src/types.ts)
or trigger autocomplete in your editor when importing `chooksie`.
:::

### Contexts

---

- `Context`
- `EventContext`
- `CommandContext`

### Modules

---

- `Event`
- `SlashCommand`
- `SlashSubcommand`
- `UserCommand`
- `MessageCommand`

### Specialized Options

---

- `Subcommand`
- `StringOption`
- `NumberOption`

### All Options

---

- `SubcommandGroup`
- `ChannelOption`
- `BoolOption`
- `UserOption`
- `RoleOption`
- `MentionableOption`
- `Choice`

### Misc

- `OnLoad`
