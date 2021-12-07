import * as pc from 'picocolors';
import { sep } from 'path';

const firstLine = /^.*\n/;
const stackLine = /^\s+at(.*)\(([^)]+)\)/gm;
const formattedStack = `  ${pc.dim('at')}$1(${pc.cyan('$2')})`;

export function formatStack(stack: string): string {
  return stack
    .replace(firstLine, '')
    .replace(process.cwd() + sep, '')
    .replace(stackLine, formattedStack);
}

export function formatError(error: Error): string {
  return typeof error.stack === 'string'
    ? `${error.message}\n\n${formatStack(error.stack)}`
    : error.message;
}
