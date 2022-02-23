# External Scripts

When developing bots, you may encounter cases where you wish to run code unrelated to your bot,
sometimes even reference your client's instance.

## Basic Scripts

By default, all `.js` and `.ts` files inside directories whose name doesn't start with a dot are watched
and executed by the framework, reloading it each time the file gets saved, which means the following file
will log `Hello, world!` each time it is saved.

:::: code-group
::: code-group-item foo/file.ts
@[code](./file.ts)
:::
::: code-group-item foo/file.js
@[code](./file.js)
:::
::::

But what if we wish to run some long running code, like a `setInterval`?

:::: code-group
::: code-group-item foo/timer.ts
@[code](./plain-timer.ts)
:::
::: code-group-item foo/timer.js
@[code](./plain-timer.js)
:::
::::

You can notice that it runs fine the first time, but once we save the file again, you will notice that
the old timer keeps on going and stacks on each other!

Obviously that's not a good sign, so how do we stop the old timer when we save the file again?

## Init Scripts

Thankfully, the framework handles a specially exported function called `chooksOnLoad`, which gets run
each time the file is saved.

::: tip
Init scripts can be async!
:::

:::: code-group
::: code-group-item foo/file.ts
@[code](./bad-timer.ts)
:::
::: code-group-item foo/file.js
@[code](./bad-timer.js)
:::
::: code-group-item foo/file.js (CJS)
@[code js](./bad-timer.cjs)
:::
::::

Now when we restart our bot (to get rid of the old timers) and start it again we should see `Hello, world!`
being printed into the console every second.

Okay it works, but when we save it again, our timers get stacked again! What gives?!

Well we didn't actually write anything that stops the timer when our file gets updated.
So, how do we tell the framework to turn off the timer once a file update comes through?

## Teardown Scripts

::: tip
Like init scripts, teardown scripts can also be async!
:::

To tell the framework what we want to do once the file gets updated, we just return another function, and
it'll get executed once a change is detected.

:::: code-group
::: code-group-item foo/file.ts
@[code](./ok-timer.ts)
:::
::: code-group-item foo/file.js
@[code](./ok-timer.js)
:::
::: code-group-item foo/file.js (CJS)
@[code js](./ok-timer.cjs)
:::
::::

For clarity's sake, we added some more logs to see when the file gets loaded and unloaded, and when we save
the file (after restarting again to get rid of the old timers), the timers no longer stack and we can see
when the file gets loaded and reloaded!

But now our script calls for reading some data off our Discord.JS client, and we also want to do some actual
logging in our script, how do we gain access to these things in our scripts?

## Script Context

Conveniently enough, the framework also passes a context object that contains the client along with a named
logger that's special to our script!

To see what's available in our context object, we can use the **Definition Function** `defineOnLoad`.

:::: code-group
::: code-group-item foo/timer.ts
@[code](./context.ts)
:::
::: code-group-item foo/timer.js
@[code](./context.js)
:::
::: code-group-item foo/timer.js (CJS)
@[code js](./context.cjs)
:::
::::

Now our script's logs are prettified and we can see which file the script is from, as well as print our
client's ping!
