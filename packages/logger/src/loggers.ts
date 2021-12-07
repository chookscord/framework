import * as pc from 'picocolors';
import { WriteOptions, write } from './write';
import { Console } from 'console';
import { isPrefix } from './utils';

export type LogLevel =
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'log'
  | 'debug'
  | 'trace';

export type Logger = (...messages: unknown[]) => void;
export type ChooksLogger = Record<LogLevel | 'success', Logger>;

// @Choooks22: If we're upgrading the output, we start here
const console = new Console(process.stdout, process.stderr);

function writeError(
  colorize: (prefix: string) => string,
  prefix: string,
  ...messages: unknown[]
): void {
  // Error is offset by 1 if messages has a prefix
  const i = Number(isPrefix(messages[0])) as 0 | 1;
  const _error = messages[i];

  const title = _error instanceof Error
    ? pc.inverse(colorize(` ${prefix} ${_error.name} `))
    : pc.inverse(colorize(` ${prefix} `));

  const options: WriteOptions = {
    out: console.error,
    prominent: true,
  };

  write(options, title, ...messages);
}

export function fatal(...messages: unknown[]): void {
  writeError(pc.red, 'FATAL', ...messages);
}

export function error(...messages: unknown[]): void {
  writeError(pc.red, 'ERROR', ...messages);
}

export function warn(...messages: unknown[]): void {
  writeError(pc.yellow, 'WARN', ...messages);
}

export function success(...messages: unknown[]): void {
  const prefix = pc.green('success');
  write({ out: console.info }, prefix, ...messages);
}

export function info(...messages: unknown[]): void {
  const prefix = pc.green('info');
  write({ out: console.info }, prefix, ...messages);
}

export function log(...messages: unknown[]): void {
  write({ out: console.log }, ...messages);
}

export function debug(...messages: unknown[]): void {
  const prefix = pc.dim('debug');
  write({ out: console.debug }, prefix, ...messages);
}

export function trace(...messages: unknown[]): void {
  const prefix = pc.dim(pc.gray('trace'));
  write({ out: console.debug }, prefix, ...messages);
}
