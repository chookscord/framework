import type { LoggerOptions } from 'pino'
import _pino from 'pino'
import type { Logger } from '../types'

export type LoggerType = 'autocomplete' | 'command' | 'subcommand' | 'user' | 'message' | 'event' | 'script'
export type LoggerFactory = (type: LoggerType, name: string) => Logger

function createLogger(opts?: LoggerOptions): LoggerFactory {
  const logger = _pino(opts)
  return (type, name): Logger => logger.child({ type, name })
}

export default createLogger
