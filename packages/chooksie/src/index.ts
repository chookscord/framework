import type { Logger } from 'pino'
import type { LoggerType } from './internals/logger.js'
import { logger } from './internals/logger.js'

export * from './types.js'

export function createLogger(type: LoggerType, name: string): Logger {
  return logger.child({ type, name })
}
