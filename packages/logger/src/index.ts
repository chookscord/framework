/* eslint-disable object-curly-newline */
import * as loggers from './loggers';
import type { ChooksLogger, Logger } from './loggers';
import { colorize as _color, attachPrefix } from './utils';

export * from './loggers';
export interface LoggerOptions {
  level?: number;
  noColor?: boolean;
  colorize?: (string: string) => string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const LOG_LEVEL = Number(process.env.LOG_LEVEL ?? '4');

export function createLogger(prefix?: string, options: LoggerOptions = {}): ChooksLogger {
  const { level = LOG_LEVEL, noColor, colorize = _color } = options;
  const _prefix = prefix && (noColor
    ? prefix
    : colorize(prefix));

  const bind: (logger: Logger) => Logger = typeof _prefix === 'string'
    ? logger => attachPrefix(logger, _prefix)
    : logger => logger;

  const add = (minLevel: number, logger: Logger) => level >= minLevel
    ? bind(logger)
    : noop;

  return {
    fatal: add(0, loggers.fatal),
    error: add(1, loggers.error),
    warn: add(2, loggers.warn),
    info: add(3, loggers.info),
    success: add(3, loggers.success),
    log: add(4, loggers.log),
    debug: add(5, loggers.debug),
    trace: add(6, loggers.trace),
  };
}
