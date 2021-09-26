import * as chalk from 'chalk';
import { Consola, default as consola } from 'consola';

export interface Logger {
  logger: Consola;
}

const COLORS = [
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
] as const;

function getTotalCharCode(string: string): number {
  let average = 0;
  const n = string.length;
  for (let i = 0; i < n; i++) {
    average += string.charCodeAt(i);
  }
  return average;
}

export function createLogger(name: string): Consola {
  const color = COLORS[getTotalCharCode(name.toUpperCase()) % COLORS.length];
  return consola.create({
    defaults: {
      message: chalk.bold[color](`${name}:`),
    },
  });
}
