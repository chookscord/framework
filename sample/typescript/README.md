# chookscord-bot-sample-typescript

## Getting started

Setup is exactly the same as you would with just plain JS,
the only difference is of course using `.ts` files, no need to add the `typescript`
package if not necessary.

You might need to set up your `tsconfig.json` file so your editor won't complain,
targeting Node 16.

### You shouldn't manually compile your project!

TS to JS compilation is done automatically by the framework.

Manually compiling your typescript project might result in unwanted behavior since
the framework automatically compiles and outputs your typescript files.
