---
title: The Setup Method
---

<!-- markdownlint-disable-next-line MD025 -->
# The `setup` Method

The `setup` method provides a reliable way to import local files and share reusable functions
across multiple commands.

This method works differently depending on the environment:

- In **development mode**, it is run each time the target `execute` function is executed, making
sure that the dynamically imported files are always updated.

- In **production mode**, the method is evaluated <u>once</u> on startup and injected into the `execute`
function, which saves resources and ensures your bot runs with minimal overhead.

## How it works

The function itself isn't special, all it does is get called and Chooksie then passes the return value
as the `this` context of the target `execute` function.

**The reason why this particular function exists is because of [Module Caching](https://nodejs.org/api/modules.html#caching) by Node.**
If you have imports in the top-level, those imports will only get updated when you reload the entire file,
which means that when you update a local file, you'll also have to **reupdate all other files that imports
that file**.

In **development mode**, the framework detects when a file is saved and refreshes Node's module cache.
This ensures that each time the relevant commands are executed and the `setup` function called, it is able
to provide the latest modules, allowing you to rerun the command in your Discord client without having to
touch the command again.

Working smartly this way instead of making `setup` just trash the module cache each time makes it so
that calling the function results in minimal overhead (since it just reuses the cache and doesn't have
to evaluate the module) and ensures that there are no discrepancies between development and production mode.

## Usage

Before we start dynamically importing files, we first need to create the file to import.

In this example, we'll be making a utilities file that manipulates strings. We begin by exporting a function
that changes a text's case to uppercase.

::: tip
You can place these files inside any directory as long as the directory is not in use by the framework
and does not start with a dot.
:::

:::: code-group
::: code-group-item TypeScript
@[code{1-5} ts{1-5}](./utils/string.ts)
:::
::: code-group-item JavaScript
@[code{1-5} js{1-5}](./utils/string.js)
:::
::: code-group-item JavaScript (CJS)
@[code{1-5} js{1-5}](./utils/string.cjs)
:::
::::

Now in our command where we want to use these functions, we can define a function
that returns our imported module.

::: tip
You can inline the function if you don't need to reuse it, use `async` functions if you wish
to use `await`, or even return something else from the module you import!

Just keep in mind that whatever you return, be it a function, a value, or even a `Promise`, it
will be the value of `this` in your `execute` function, so you can be as creative as you want!
:::

:::: code-group
::: code-group-item TypeScript
@[code ts{4-6,23,26}](./subcommands/setup-a.ts)
:::
::: code-group-item JavaScript
@[code js{4-6,23,26}](./subcommands/setup-a.js)
:::
::: code-group-item JavaScript (CJS)
@[code js{4-6,23,26}](./subcommands/setup-a.cjs)
:::
::::

Running the command `/string upper` should now reply with the text in all lowercase!

Going back in our utilities file, we can export another function that transforms a text to be all uppercase:

:::: code-group
::: code-group-item TypeScript
@[code ts{6-8}](./utils/string.ts)
:::
::: code-group-item JavaScript
@[code js{6-8}](./utils/string.js)
:::
::: code-group-item JavaScript (CJS)
@[code js{6-8}](./utils/string.cjs)
:::
::::

Saving that file and heading to our command file, define a new subcommand that uses the new function.

:::: code-group
::: code-group-item TypeScript
@[code ts{34,37}](./subcommands/setup-b.ts)
:::
::: code-group-item JavaScript
@[code js{34,37}](./subcommands/setup-b.js)
:::
::: code-group-item JavaScript (CJS)
@[code js{34,37}](./subcommands/setup-b.cjs)
:::
::::

While writing the command, you may have noticed that typing `this` in the `execute` function already gives
suggestions (assuming you use an editor that supports it) that both `upper` and `lower` exists.

Now saving the file, a new command called `/string lower` should be available in your Discord client, and
using it should reply back with a text that's in uppercase!

You've just created a new utility file, made a new command and used the new file, and run the command in
your Discord client, all without having to reload or restart your bot!
