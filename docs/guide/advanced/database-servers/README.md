# Database and Servers

For more advanced bots, connecting to databases or making your bot's statistics public using a server are
commonly seen.

## Connecting to Databases

Since there are tons of different databases and ways to connect to them, this guide won't be able to cover
all the different methods of connecting.

As long as the driver supports connecting to the database separately, this guide should be close enough.

For simplicity's sake, we'll try implementing a database connection with
[Sequelize](https://www.npmjs.com/package/sequelize) following Discord.JS's
[guide](https://discordjs.guide/sequelize/).

> To not make this section overly long, we'll only implement 2 of 6 of the commands from the guide.

:::: code-group
::: code-group-item db/index.ts
@[code](./db/index.ts)
:::
::: code-group-item db/index.js
@[code](./db/index.js)
:::
::: code-group-item db/index.js (CJS)
@[code js](./db/index.cjs)
:::
::::

Next, we can define a function that exposes our `Tag` model that we can pass in our `setup` methods:

:::: code-group
::: code-group-item subcommands/tags.ts
@[code{4-8}](./subcommands/tags.ts)
:::
::: code-group-item subcommands/tags.js
@[code{4-8}](./subcommands/tags.js)
:::
::: code-group-item subcommands/tags.js (CJS)
@[code{4-8} js](./subcommands/tags.cjs)
:::
::::

Using the function we created above, we can define our first subcommand that creates tags for us:

:::: code-group
::: code-group-item subcommands/tags.ts
@[code{10-52}](./subcommands/tags.ts)
:::
::: code-group-item subcommands/tags.js
@[code{10-52}](./subcommands/tags.js)
:::
::: code-group-item subcommands/tags.js (CJS)
@[code{10-52} js](./subcommands/tags.cjs)
:::
::::

Then, we create the second command that fetches our tags, just so we can see in our Discord client that
saving and searching for tags work:

:::: code-group
::: code-group-item subcommands/tags.ts
@[code{54-98}](./subcommands/tags.ts)
:::
::: code-group-item subcommands/tags.js
@[code{54-98}](./subcommands/tags.js)
:::
::: code-group-item subcommands/tags.js (CJS)
@[code{54-98} js](./subcommands/tags.cjs)
:::
::::

Once we connect all these up, we should have the following command file:

:::: code-group
::: code-group-item subcommands/tags.ts
@[code](./subcommands/tags.ts)
:::
::: code-group-item subcommands/tags.js
@[code](./subcommands/tags.js)
:::
::: code-group-item subcommands/tags.js (CJS)
@[code js](./subcommands/tags.cjs)
:::
::::

If all things went right, you should now have two new commands available in the Discord client, and searching
for tags should also give you autocomplete suggestions on tags you've previously created!

## Creating Servers
