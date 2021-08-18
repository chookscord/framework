# chookscord-bot-sample-typescript

## Getting started

Setup is exactly the same as you would with just plain JS,
the only difference is of course using `.ts` files and adding `typescript`
as a dev dependency.

```sh
$ yarn add chookscord
$ yarn add -D typescript
```

You need to set up your `tsconfig.json` file only so your editor won't complain,
targeting Node 16.

### You shouldn't manually compile your project!

When you have TS installed, the framework detects this and automatically switches
to TS mode without any extra setup!
