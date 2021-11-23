#! /usr/bin/env node
require('dotenv/config');
process.env.NODE_ENV ??= 'production';
const args = process.argv.slice(2);
const index = args.indexOf('--esm');
const esm = index > -1;

if (esm) {
  args.splice(index, 1);
  process.env.MODULE_TYPE = 'esm';
} else {
  process.env.MODULE_TYPE = 'cjs';
}

const run = script => require(script).run();
const dev = script => {
  process.env.NODE_ENV = 'development';
  const path = require.resolve(script);
  const loader = require.resolve('./loader.js');
  require('child_process').fork(path, {
    execArgv: ['--loader', loader],
  });
};

switch (args[0] ?? 'dev') {
  case 'build': run('@chookscord/cli/build'); break;
  case 'register': run('@chookscord/cli/register'); break;
  case 'dev':
  default: (esm ? dev : run)('@chookscord/cli/dev');
}
