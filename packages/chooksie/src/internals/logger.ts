import type { DestinationStream, LoggerOptions } from 'pino'
import { pino as _pino } from 'pino'
import type { Logger } from '../types.js'

export type LoggerType = 'app' | 'autocomplete' | 'command' | 'subcommand' | 'user' | 'message' | 'event' | 'script' | 'modal' | 'button'
export type LoggerFactory = (type: LoggerType, name: string) => Logger

function createLogger(opts?: LoggerOptions | DestinationStream): LoggerFactory {
  const logger = _pino(opts)
  return (type, name): Logger => logger.child({ type, name })
}

export default createLogger
