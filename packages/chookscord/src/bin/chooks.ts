#! /usr/bin/env node
const args = process.argv.slice(2);

// dev script
async function main() {
  const dev = await import('../scripts/dev');
  await dev.run();
}

// register script
async function registerCommands() {
  const register = await import ('../scripts/register');
  await register.run();
}

// build script
async function buildProject() {
  const build = await import('../scripts/build');
  await build.run();
}

async function startApp() {
  const start = await import('../scripts/start');
  await start.run();
}

if (!args.length) {
  main();
}

if (args[0] === 'register') {
  registerCommands();
}

if (args[0] === 'build') {
  buildProject();
}

if (args[0] === 'start') {
  startApp();
}
