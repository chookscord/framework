#! /usr/bin/env node
const args = process.argv.slice(2);

// dev script
async function main() {
  const { dev } = await import('../scripts');
  await dev.run();
}

// register script
async function registerCommands() {
  const { register } = await import ('../scripts');
  await register.run();
}

if (!args.length) {
  main();
}

if (args[0] === 'register') {
  registerCommands();
}
