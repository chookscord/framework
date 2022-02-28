# Chooksie

Welcome to Chooksie! The fastest way to create modern Discord Bots with all the latest features
like Slash Commands and Autocompletes, while still maintaning the ease and simplicity of developing
the now deprecated Legacy (Message) Commands.

## The Problem

Back then, writing Discord bots were much more simpler, but also much less structured. This had the advantage
that those completely new to programming were able to dive in with using the Discord.JS library, but also
having the disadvantage of following multiple, often conflicting guides.

This was when Discord.JS frameworks like [Commando](https://github.com/discordjs/Commando) and
[Akairo](https://discord-akairo.github.io) began to surface, aiming to streamline the process of creating
Discord bots.

Fast forward to 2021, Discord announces that [Message Content will now become a Privileged Intent](https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Privileged-Intent-for-Verified-Bots)
and the new [Slash Commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ)
feature, effectively forcing most bot owners to move to the new API.

These updates have caused a massive shift in the way Discord bots are written. User inputs are now built
in and command discoverability is now handled by the Discord client, but introduces the added complexity
of requiring your bot to [constantly sync](https://discord.com/developers/docs/interactions/application-commands#updating-and-deleting-a-command) to Discord's API.

This is where Chooksie comes in. Our goal is to streamline the process again, integrating hot code reloads
with real-time command syncing: resulting in removing multiple repetitive steps which adds up to saving
minutes of what otherwise would have been you staring at your screen.

## How Does This Help Me Write Bots Faster?

Chooksie was built from the ground up for the new [Application Commands](https://discord.com/developers/docs/interactions/application-commands)
system, this means we don't have the burden of having to maintain compatibility with Legacy Commands,
allowing us to optimize for working with Application Commands.

How much optimization have we achieved with this? Here's a side-by-side code comparison against the popular
[Sapphire](https://www.sapphirejs.dev/) Framework implementing the basic `/ping` Slash Command:

#### Using @sapphire/framework

:::: code-group
::: code-group-item Type-Safe
@[code](./sapphire.ts)
:::
::: code-group-item Minimal
@[code](./sapphire-min.js)
:::
::::

#### Using Chooksie

:::: code-group
::: code-group-item Type-Safe
@[code](./chooksie.ts)
:::
::: code-group-item Minimal
@[code](./chooksie-min.js)
:::
::::

As you can see, Chooksie uses plain objects to define your commands, only requiring the developer to
define the bare minimum needed to register commands.

Not only does using plain objects makes for tinier, declarative command definitions, but it also allows
us to take advantage of TypeScript interfaces and provide type information to JavaScript files, as seen
in the Type-Safe Chooksie example, where no special TypeScript syntax were used.
