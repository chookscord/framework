#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';

const program = new Command();

program
  .action(async () => {
    const { init } = await import('../scripts/dev');
    init();
  });

program.parse(process.argv);
