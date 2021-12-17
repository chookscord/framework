#! /usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
import 'dotenv/config';
// @ts-ignore package.json is aliased only
import cli from '@chookscord/cli/package.json';
import path from 'path';
import pc from 'picocolors';

process.env.NODE_ENV ??= 'production';
process.env.CHOOKSIE_VERSION = cli.version;
console.info(`${pc.blue('chooks')} Using @chookscord/cli@${cli.version}`);

const args = process.argv.slice(2);

const run = (script: string) => {
  require(script).run();
};

const dev = (script: string) => {
  process.env.NODE_ENV = 'development';
  const devPath = require.resolve(script);
  const loader = require.resolve('./loader.js');
  require('child_process').fork(devPath, {
    execArgv: ['--loader', loader],
  });
};

// eslint-disable-next-line complexity
(() => {
  // Scripts not needing package info
  switch (args[0]) {
    case 'init': run('@chookscord/cli/scaffold'); return;
  }

  const pkg = require(path.resolve('package.json'));
  const esm = pkg.type === 'module';

  process.env.MODULE_TYPE = pkg.type ?? 'commonjs';

  switch (args[0]) {
    case 'build': run('@chookscord/cli/build'); break;
    case 'register': run('@chookscord/cli/register'); break;
    case undefined: (esm ? dev : run)('@chookscord/cli/dev'); break;
    default:
      console.error(`${pc.red('error')} unknown command.`);
      process.exit(64);
  }
})();
