# Payloads in Custom IDs

Sometimes, you might run into a use case where you need to pass custom data into your modal or button handlers
that just isn't available from the Interaction object itself, like timestamps or custom input.

To solve this issue, you can pass extra data when you create your message component by adding setting them
in your Custom ID separated by a pipe (`|`).

## Passing Data to Custom IDs

To attach extra data in your Custom IDs, add them in front of your actual ID separated by the Pipe (`|`)
character.

::: tip
You can use any string format you prefer, like CSV or JSON.
:::

::: warning
The 100-character Custom ID limit still applies!
:::

:::: code-group
::: code-group-item commands/timer.ts
@[code ts{11}](./creating-payload.ts)
:::
::: code-group-item commands/timer.js
@[code js{11}](./creating-payload.js)
:::
::: code-group-item commands/timer.js (CJS)
@[code js{11}](./creating-payload.cjs)
:::
::::

## Getting Data from Custom IDs

Everything past the first `|` character are then passed as a string into your handlers via the `payload` prop.

::: warning
The `payload` property is `null` by default.
:::

:::: code-group
::: code-group-item buttons/end-timer.ts
@[code ts{4,7}](./consuming-payload.ts)
:::
::: code-group-item buttons/end-timer.js
@[code js{4,7}](./consuming-payload.js)
:::
::: code-group-item buttons/end-timer.js (CJS)
@[code js{4,7}](./consuming-payload.cjs)
:::
::::
