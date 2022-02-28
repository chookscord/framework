# Fetch API

Chooksie provides a custom [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
wrapper based on the [Undici](https://npmjs.com/package/undici) HTTP client.

## Usage

To get started, install the [`undici`](https://npmjs.com/package/undici) package.

:::: code-group
::: code-group-item NPM
@[code](./install-npm.sh)
:::
::: code-group-item Yarn
@[code](./install-yarn.sh)
:::
::: code-group-item PNPM
@[code](./install-pnpm.sh)
:::
::::

Then, to start using the wrapper, import `fetch` from `chooksie/fetch`:

:::: code-group
::: code-group-item scripts/fetch.ts
@[code](./fetch-basic.ts)
:::
::: code-group-item scripts/fetch.js
@[code js](./fetch-basic.mjs)
:::
::: code-group-item scripts/fetch.js (CJS)
@[code js](./fetch-basic.mjs)
:::
::::

Out of the box, `fetch` works exactly the same as
[`undici.fetch`](https://github.com/nodejs/undici#undicifetchinput-init-promise), but it also includes a
couple of utilities to improve your dev experience:

:::: code-group
::: code-group-item scripts/fetch.ts
@[code{2-} ts{13,17,30,34}](./fetch-advanced.ts)
:::
::: code-group-item scripts/fetch.js
@[code js{6,10,23,27}](./fetch-advanced.mjs)
:::
::: code-group-item scripts/fetch.js (CJS)
@[code js{6,10,23,27}](./fetch-advanced.mjs)
:::
::::

Shorthands for HTTP `get`, `post`, `put`, `patch`, `delete` methods and parsing body using `json`, `blob`,
`text`, `arrayBuffer`, and `body` are available.
