import type { DestinationStream, LoggerOptions } from 'pino'
import { pino as _pino } from 'pino'
import type { Logger } from '../types.js'

export type LoggerType = 'app' | 'autocomplete' | 'command' | 'subcommand' | 'user' | 'message' | 'event' | 'script' | 'modal' | 'button'
export type LoggerFactory = (type: LoggerType, name: string) => Logger

export let logger: Logger

export function registerLogger(opts?: LoggerOptions | DestinationStream): void {
  if (logger !== undefined) {
    throw new Error('logger already registered!')
  }
  logger = _pino(opts)
}
