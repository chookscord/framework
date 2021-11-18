#! /usr/bin/env node
const args = process.argv.slice(2);
const index = args.indexOf('--esm');
const esm = index > -1;

if (esm) {
  args.splice(index, 1);
}

const run = script => require(script).run();

switch (args[0] ?? 'dev') {
  case 'build': run('@chookscord/cli/build'); break;
  case 'register': run('@chookscord/cli/register'); break;
  case 'dev':
  default: run('@chookscord/cli/dev');
}
