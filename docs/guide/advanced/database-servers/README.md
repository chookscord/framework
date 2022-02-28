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

While we are using a specific web framework for our examples, feel free to bring any web framework you like,
as long as the framework is flexible enough to not interfere with our existing project.

For this guide, we will be using [Fastify](https://www.npmjs.com/package/fastify) to make our web server. If
you've worked with or are familiar with [Express](https://www.npmjs.com/package/express), then working with
Fastify should feel familiar.

To start off, we create our web server inside the `chooksOnLoad` script so we can safely initialize and
destroy the server:

:::: code-group
::: code-group-item server/fastify.ts
@[code ts{2,8-12,15,20}](./server/init.ts)
:::
::: code-group-item server/fastify.js
@[code js{2,8-12,15,20}](./server/init.mjs)
:::
::: code-group-item server/fastify.js (CJS)
@[code js{2,8-12,15,20}](./server/init.cjs)
:::
::::

Then to keep things clean, we can define our routes in a separate file:

:::: code-group
::: code-group-item server/routes.ts
@[code ts{6,8-10,13-15,18}](./server/routes-init.ts)
:::
::: code-group-item server/routes.js
@[code js{2,4-6,9-11,14}](./server/routes-init.mjs)
:::
::: code-group-item server/routes.js (CJS)
@[code js{2,4-6,9-11,14}](./server/routes-init.cjs)
:::
::::

Then back in our main file, we can import our routes and register it into our server:

:::: code-group
::: code-group-item server/fastify.ts
@[code ts{3,15-16}](./server/fastify.ts)
:::
::: code-group-item server/fastify.js
@[code js{3,15-16}](./server/fastify.mjs)
:::
::: code-group-item server/fastify.js (CJS)
@[code js{3,15-16}](./server/fastify.cjs)
:::
::::

If your application is running, you should already be able to open your browser and make a request to your
server and it should respond.

Great! But now we want to add another route in our routes file. While we know our file gets updated each time
we save it, how about those that depend on the file, like our server file?

Well why don't we add another route and see:

:::: code-group
::: code-group-item server/routes.ts
@[code ts{18-20}](./server/routes.ts)
:::
::: code-group-item server/routes.js
@[code js{14-16}](./server/routes.mjs)
:::
::: code-group-item server/routes.js (CJS)
@[code js{14-16}](./server/routes.cjs)
:::
::::

We save the file and then... our server restarted on its own?  
Making a request to the new route, we can properly see the response we just added. How?

### Reloading the Dependency Chain

That's because just like what we explained in [External Scripts](../scripts/README.md), the framework has
full control over Node's **Module Cache**, and so the framework can intelligently reload dependent modules,
while leaving untouched dependencies alone.

**What does that mean? Well take this for example:**

We have 4 modules, `A`, `B`, `C`, and `D`. Module `A` depends on `B`, module `B` on `C`, and `C` on `D`.

```txt
A -> B -> C -> D
```

Say we made changes to module `C`. Module `D` shouldn't be affected since it's not dependent on module `C`.
Meanwhile, modules `A` and `B` does rely on module `C`, and so should be updated.

The framework then goes to the cache and removes modules `A`, `B`, and `C`, while leaving module `D` alone
while also loading their scripts again, effectively reloading the modules `A` `B` and `C` and letting module
`C` load the cached version of module `D`.

```txt {5}
A -> B -> C -> D
          ^
       updated

new A -> new B -> new C -> old D
```

This results in a very clean and efficient way to write modular scripts without having to fully restart your
application, which if you're paying attention is a recurring theme in our framework.

It is also quite a fun experience to work with!
