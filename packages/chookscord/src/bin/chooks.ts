#! /usr/bin/env node
const args = process.argv.slice(2);

// dev script
async function main() {
  const { dev } = await import('../scripts');
  await dev.run();
}

if (!args.length) {
  main();
}
