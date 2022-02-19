import type { DestinationStream, LoggerOptions } from 'pino'
import _pino from 'pino'
import type { Logger } from '../types'

export type LoggerType = 'app' | 'autocomplete' | 'command' | 'subcommand' | 'user' | 'message' | 'event' | 'script'
export type LoggerFactory = (type: LoggerType, name: string) => Logger

function createLogger(opts?: LoggerOptions | DestinationStream): LoggerFactory {
  const logger = _pino(opts)
  return (type, name): Logger => logger.child({ type, name })
}

export default createLogger
