#! /usr/bin/env node
require('dotenv/config');
const path = require('path');
const pkg = require(path.resolve(process.cwd(), 'package.json'));
const chooksie = require('@chookscord/cli/package.json');
const logger = require('@chookscord/logger').createLogger('chooks');

process.env.NODE_ENV ??= 'production';
process.env.MODULE_TYPE = pkg.type ?? 'commonjs';
process.env.CHOOKSIE_VERSION = chooksie.version;
logger.info(`Using chooksie v${chooksie.version}`);

const args = process.argv.slice(2);
const esm = pkg.type === 'module';

const run = script => require(script).run();
const dev = script => {
  process.env.NODE_ENV = 'development';
  const devPath = require.resolve(script);
  const loader = require.resolve('./loader.js');
  require('child_process').fork(devPath, {
    execArgv: ['--loader', loader],
  });
};

switch (args[0]) {
  case 'build': run('@chookscord/cli/build'); break;
  case 'register': run('@chookscord/cli/register'); break;
  case undefined: (esm ? dev : run)('@chookscord/cli/dev'); break;
  default:
    console.error(`${require('picocolors').red('error')} unknown command.`);
    process.exit(64);
}
